import { DbCheck, DbColumn, DbForeignKey, DbIndex, DbTable, DbUnique, Dialect } from './types.js';

export const camel = (name: string): string => name.replace(/[_\-\s]+(\w)/g, (_: string, c: string) => c.toUpperCase());

export const pascal = (name: string): string => {
  const value: string = camel(name);

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const INTEGER: string[] = ['tinyint', 'smallint', 'mediumint', 'int', 'bigint', 'year'];
const SIZED: string[] = ['varchar', 'char', 'binary', 'varbinary'];
const PLAIN: string[] = [
  'text', 'tinytext', 'mediumtext', 'longtext', 'blob', 'tinyblob', 'mediumblob', 'longblob',
  'date', 'datetime', 'timestamp', 'time', 'year', 'json', 'float', 'double',
];

/** A column type after a strict parse. Only these shapes reach the generators. `array` is Postgres only. */
export type ParsedType = (
  | { kind: 'boolean' }
  | { kind: 'integer'; base: string; unsigned: boolean }
  | { kind: 'decimal'; precision: number; scale: number }
  | { kind: 'sized'; base: string; length: number }
  | { kind: 'enum'; values: string[] }
  | { kind: 'plain'; base: string; precision?: number }
) & { array?: true };

const unsupported = (column: DbColumn): Error =>
  new Error(`Unsupported type "${column.columnType}" for column ${column.name}`);

/** Parses MySQL enum values (`'a','it''s'`). Returns undefined when the list is malformed. */
const enumValues = (args: string): string[] | undefined => {
  const values: string[] = [...args.matchAll(/'((?:[^']|'')*)'/g)].map((m: RegExpMatchArray) => m[1]);
  const rebuilt: string = values.map((value: string) => `'${value}'`).join(',');

  return values.length && rebuilt === args ? values.map((value: string) => value.replace(/''/g, "'")) : undefined;
};

const parseMysqlType = (column: DbColumn): ParsedType => {
  const match: RegExpMatchArray | null = column.columnType.match(/^([a-z]+)(?:\((.*)\))?( unsigned)?( zerofill)?$/);
  if (!match) {
    throw unsupported(column);
  }
  const [, base, args = '', unsigned] = match;

  if (base === 'enum') {
    const values: string[] | undefined = enumValues(args);
    if (values) {
      return { kind: 'enum', values };
    }
  } else if (base === 'decimal') {
    const size: RegExpMatchArray | null = args.match(/^(\d+)(?:,(\d+))?$/);
    if (size) {
      return { kind: 'decimal', precision: Number(size[1]), scale: Number(size[2] ?? 0) };
    }
  } else if (args === '' || /^\d+$/.test(args)) {
    if (base === 'tinyint' && args === '1') {
      return { kind: 'boolean' };
    }
    if (SIZED.includes(base) && args) {
      return { kind: 'sized', base, length: Number(args) };
    }
    if (INTEGER.includes(base)) {
      return { kind: 'integer', base, unsigned: Boolean(unsigned) };
    }
    if (PLAIN.includes(base)) {
      return { kind: 'plain', base };
    }
  }
  throw unsupported(column);
};

const POSTGRES_PLAIN: Record<string, string> = {
  text: 'text',
  date: 'date',
  'time without time zone': 'time',
  'timestamp without time zone': 'timestamp',
  'timestamp with time zone': 'timestamptz',
  json: 'json',
  jsonb: 'jsonb',
  uuid: 'uuid',
  real: 'real',
  'double precision': 'doublePrecision',
  'character varying': 'varchar',
  numeric: 'numeric',
};

const parsePostgresScalar = (column: DbColumn, type: string): ParsedType => {
  const enumMatch: RegExpMatchArray | null = type.match(/^enum\((.*)\)$/);
  const values: string[] | undefined = enumMatch ? enumValues(enumMatch[1]) : undefined;
  if (values) {
    return { kind: 'enum', values };
  }
  if (['smallint', 'integer', 'bigint'].includes(type)) {
    return { kind: 'integer', base: type, unsigned: false };
  }
  if (type === 'boolean') {
    return { kind: 'boolean' };
  }
  const decimal: RegExpMatchArray | null = type.match(/^numeric\((\d+),(\d+)\)$/);
  if (decimal) {
    return { kind: 'decimal', precision: Number(decimal[1]), scale: Number(decimal[2]) };
  }
  const sized: RegExpMatchArray | null = type.match(/^(character varying|character)\((\d+)\)$/);
  if (sized) {
    return { kind: 'sized', base: sized[1] === 'character' ? 'char' : 'varchar', length: Number(sized[2]) };
  }
  if (POSTGRES_PLAIN[type]) {
    return { kind: 'plain', base: POSTGRES_PLAIN[type] };
  }
  const precise: RegExpMatchArray | null = type.match(/^(timestamp|time)\((\d+)\)( with(?:out)? time zone)$/);
  if (precise && POSTGRES_PLAIN[precise[1] + precise[3]]) {
    return { kind: 'plain', base: POSTGRES_PLAIN[precise[1] + precise[3]], precision: Number(precise[2]) };
  }
  throw unsupported(column);
};

/** One-dimensional arrays only: `text[]` parses, `text[][]` does not. */
const parsePostgresType = (column: DbColumn): ParsedType => {
  const array: RegExpMatchArray | null = column.columnType.match(/^(.*[^\]])\[\]$/);

  return array
    ? { ...parsePostgresScalar(column, array[1]), array: true }
    : parsePostgresScalar(column, column.columnType);
};

/** Parses a column type in its dialect's syntax. Throws on anything generaptr cannot map. */
export const parseColumnType = (column: DbColumn, dialect: Dialect): ParsedType =>
  dialect === 'mysql' ? parseMysqlType(column) : parsePostgresType(column);

export const primaryColumns = (table: DbTable): DbColumn[] =>
  (table.primaryKey?.columns ?? []).map((name: string) => table.columns.find((column: DbColumn) => column.name === name) as DbColumn);

/** Tables with one primary key column get CRUD routes. Link tables do not. */
export const routedTables = (tables: DbTable[]): DbTable[] =>
  tables.filter((table: DbTable) => primaryColumns(table).length === 1);

export const routePath = (table: DbTable): string => `/${table.name.replace(/_/g, '-')}`;

/**
 * Splits `text` at the commas outside quotes and brackets, from `start` to the bracket that closes the one before
 * `start`. Returns the parts, trimmed.
 */
export const splitList = (text: string, start: number): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let from: number = start;
  for (let i = start; i < text.length; i++) {
    const char: string = text[i];
    if (char === "'" || char === '"') {
      i = text.indexOf(char, i + 1);
    } else if (char === '(') {
      depth++;
    } else if (char === ')' && depth-- === 0) {
      return [...parts, text.slice(from, i).trim()];
    } else if (char === ',' && depth === 0) {
      parts.push(text.slice(from, i).trim());
      from = i + 1;
    }
  }
  throw new Error(`Unbalanced list in ${text}`);
};

const SAFE_NAME: RegExp = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Names become JS identifiers, URL paths, and file names in generated code. */
export const assertSafeNames = (tables: DbTable[]): void => {
  const names: string[] = tables.flatMap((table: DbTable) => [
    table.name,
    ...table.columns.flatMap((column: DbColumn) => [column.name, ...(column.enumName ? [column.enumName] : [])]),
    ...(table.primaryKey ? [table.primaryKey.name, ...table.primaryKey.columns] : []),
    ...(table.uniques ?? []).flatMap((unique: DbUnique) => [unique.name, ...unique.columns]),
    ...(table.foreignKeys ?? []).flatMap((key: DbForeignKey) => [key.name, key.table, ...key.columns, ...key.foreignColumns]),
    ...(table.checks ?? []).map((check: DbCheck) => check.name),
    ...(table.indexes ?? []).map((index: DbIndex) => index.name),
  ]);
  const unsafe: string | undefined = names.find((name: string) => !SAFE_NAME.test(name));
  if (unsafe !== undefined) {
    throw new Error(`Unsafe name "${unsafe}": generaptr supports names with letters, digits, and _ only`);
  }
};
