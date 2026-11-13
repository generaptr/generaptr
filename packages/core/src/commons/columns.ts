import { DbColumn, DbTable } from './types';

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

/** A MySQL COLUMN_TYPE after a strict parse. Only these shapes reach the generators. */
export type ParsedType =
  | { kind: 'boolean' }
  | { kind: 'integer'; base: string; unsigned: boolean }
  | { kind: 'decimal'; precision: number; scale: number }
  | { kind: 'sized'; base: string; length: number }
  | { kind: 'enum'; values: string[] }
  | { kind: 'plain'; base: string };

const unsupported = (column: DbColumn): Error =>
  new Error(`Unsupported MySQL type "${column.columnType}" for column ${column.name}`);

/** Parses MySQL enum values (`'a','it''s'`). Returns undefined when the list is malformed. */
const enumValues = (args: string): string[] | undefined => {
  const values: string[] = [...args.matchAll(/'((?:[^']|'')*)'/g)].map((m: RegExpMatchArray) => m[1]);
  const rebuilt: string = values.map((value: string) => `'${value}'`).join(',');

  return values.length && rebuilt === args ? values.map((value: string) => value.replace(/''/g, "'")) : undefined;
};

export const parseColumnType = (column: DbColumn): ParsedType => {
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

export const primaryColumns = (table: DbTable): DbColumn[] => table.columns.filter((column: DbColumn) => column.primary);

/** Tables with one primary key column get CRUD routes. Link tables do not. */
export const routedTables = (tables: DbTable[]): DbTable[] =>
  tables.filter((table: DbTable) => primaryColumns(table).length === 1);

export const routePath = (table: DbTable): string => `/${table.name.replace(/_/g, '-')}`;

const SAFE_NAME: RegExp = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Names become JS identifiers, URL paths, and file names in generated code. */
export const assertSafeNames = (tables: DbTable[]): void => {
  const names: string[] = tables.flatMap((table: DbTable) => [
    table.name,
    ...table.columns.flatMap((column: DbColumn) => [
      column.name,
      ...(column.references ? [column.references.table, column.references.column] : []),
    ]),
  ]);
  const unsafe: string | undefined = names.find((name: string) => !SAFE_NAME.test(name));
  if (unsafe !== undefined) {
    throw new Error(`Unsafe name "${unsafe}": generaptr supports names with letters, digits, and _ only`);
  }
};
