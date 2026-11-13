import {
  assertSafeNames, camel, type ParsedType, parseColumnType, pascal, primaryColumns, routedTables, routePath,
} from '../../commons/columns.js';
import { type Relation, routedRelations } from '../../commons/relations.js';
import {
  DbCheck, DbColumn, DbForeignKey, DbSchema, DbTable, DbUnique, Dialect, PackageJsonInfo, REFERENTIAL_ACTIONS, ReferentialAction,
} from '../../commons/types.js';

// razor: plain objects typed loosely; switch to `openapi-types` if callers need deep typing.
type JsonSchema = Record<string, any>;
export type OpenApiDocument = {
  openapi: string;
  'x-dialect': Dialect;
  info: { title: string; version: string; description?: string };
  paths: Record<string, Record<string, unknown>>;
  components: { schemas: Record<string, JsonSchema> };
};

const scalarSchema = (type: ParsedType): JsonSchema => {
  switch (type.kind) {
    case 'boolean':
      return { type: 'boolean' };
    case 'integer':
      return type.unsigned ? { type: 'integer', minimum: 0 } : { type: 'integer' };
    case 'decimal':
      return { type: 'string', description: `decimal(${type.precision},${type.scale})` };
    case 'sized':
      return { type: 'string', maxLength: type.length };
    case 'enum':
      return { type: 'string', enum: type.values };
    case 'plain': {
      const formats: Record<string, string> = {
        date: 'date', datetime: 'date-time', timestamp: 'date-time', timestamptz: 'date-time', time: 'time', uuid: 'uuid',
      };
      if (['float', 'double', 'real', 'doublePrecision'].includes(type.base)) {
        return { type: 'number' };
      }
      if (type.base === 'json' || type.base === 'jsonb') {
        return {};
      }
      return formats[type.base] ? { type: 'string', format: formats[type.base] } : { type: 'string' };
    }
  }
};

const baseSchema = (type: ParsedType): JsonSchema =>
  type.array ? { type: 'array', items: scalarSchema(type) } : scalarSchema(type);

const propertySchema = (column: DbColumn, dialect: Dialect): JsonSchema => {
  const schema: JsonSchema = baseSchema(parseColumnType(column, dialect));
  if (!column.nullable || schema.type === undefined) {
    return schema;
  }

  return { ...schema, type: [schema.type, 'null'], ...(schema.enum ? { enum: [...schema.enum, null] } : {}) };
};

/** The table's keys, as `DbTable` holds them. */
const keysOf = ({ primaryKey, uniques, foreignKeys }: DbTable): JsonSchema => ({
  ...(primaryKey ? { primaryKey } : {}), ...(uniques ? { uniques } : {}), ...(foreignKeys ? { foreignKeys } : {}),
});

const rowSchema = (table: DbTable, dialect: Dialect): JsonSchema => ({
  type: 'object',
  'x-table': table.name,
  'x-keys': keysOf(table),
  ...(table.checks ? { 'x-checks': table.checks } : {}),
  required: table.columns.map((column: DbColumn) => camel(column.name)),
  properties: Object.fromEntries(table.columns.map((column: DbColumn) => [
    camel(column.name),
    { ...propertySchema(column, dialect), 'x-column': { ...column } },
  ])),
});

const writable = (table: DbTable): DbColumn[] => table.columns.filter((column: DbColumn) => !column.autoIncrement);

const inputSchema = (table: DbTable, requireColumns: boolean, dialect: Dialect): JsonSchema => ({
  type: 'object',
  additionalProperties: false,
  ...(requireColumns ? {
    required: writable(table)
      .filter((column: DbColumn) => !column.nullable && column.default === undefined)
      .map((column: DbColumn) => camel(column.name)),
  } : {}),
  properties: Object.fromEntries(writable(table).map((column: DbColumn) => [camel(column.name), propertySchema(column, dialect)])),
});

const ref = (name: string): JsonSchema => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: JsonSchema): JsonSchema => ({ content: { 'application/json': { schema } } });
const errorResponse = (description: string): JsonSchema => ({ description, ...json(ref('Error')) });

/** A row plus the relations that `?with=` adds. Without relations, the plain row. */
const rowWith = (name: string, relations: Relation[]): JsonSchema => relations.length
  ? {
    allOf: [ref(name), {
      type: 'object',
      properties: Object.fromEntries(relations.map((relation: Relation) => [
        relation.name,
        relation.kind === 'one'
          ? { anyOf: [ref(pascal(relation.target)), { type: 'null' }] }
          : { type: 'array', items: ref(pascal(relation.target)) },
      ])),
    }],
  }
  : ref(name);

const tablePaths = (table: DbTable, dialect: Dialect, relations: Relation[]): Record<string, Record<string, unknown>> => {
  const name: string = pascal(table.name);
  const [primary] = primaryColumns(table);
  const idParameter: JsonSchema = {
    name: 'id', in: 'path', required: true, schema: baseSchema(parseColumnType(primary, dialect)),
  };
  const query = (param: string, description: string): JsonSchema => ({
    name: param, in: 'query', required: false, description, schema: { type: 'integer', minimum: 0 },
  });
  const withParameter: JsonSchema[] = relations.length ? [{
    name: 'with',
    in: 'query',
    required: false,
    description: 'Relations to include, separated by commas. A nested list has at most 100 rows. An unknown name gets 400.',
    style: 'form',
    explode: false,
    schema: { type: 'array', items: { type: 'string', enum: relations.map((relation: Relation) => relation.name) } },
  }] : [];

  return {
    [routePath(table)]: {
      get: {
        operationId: `list${name}`,
        parameters: [query('limit', 'Rows to return, at most 100. Default 20.'), query('offset', 'Rows to skip.'), ...withParameter],
        responses: { 200: { description: `A page of ${table.name}`, ...json({ type: 'array', items: rowWith(name, relations) }) } },
      },
      post: {
        operationId: `create${name}`,
        requestBody: { required: true, ...json(ref(`${name}Input`)) },
        responses: {
          201: {
            description: 'Created',
            headers: { Location: { schema: { type: 'string' } } },
            ...json({ type: 'object', properties: { [camel(primary.name)]: idParameter.schema } }),
          },
          400: errorResponse('Invalid request body'),
        },
      },
    },
    [`${routePath(table)}/{id}`]: {
      parameters: [idParameter],
      get: {
        operationId: `get${name}`,
        ...(withParameter.length ? { parameters: withParameter } : {}),
        responses: { 200: { description: 'Found', ...json(rowWith(name, relations)) }, 404: errorResponse('Not found') },
      },
      put: {
        operationId: `update${name}`,
        requestBody: { required: true, ...json(ref(`${name}Update`)) },
        responses: { 204: { description: 'Updated' }, 400: errorResponse('Invalid request body') },
      },
      delete: {
        operationId: `delete${name}`,
        responses: { 204: { description: 'Deleted' } },
      },
    },
  };
};

/** The OpenAPI 3.1 contract of the API that `renderApi` writes for the same tables. */
export const openApiDocument = (
  { dialect, tables }: DbSchema,
  info: Omit<PackageJsonInfo, 'author' | 'license'>,
): OpenApiDocument => {
  assertSafeNames(tables);
  const routed: DbTable[] = routedTables(tables);
  const relations: Map<string, Relation[]> = routedRelations(tables);
  const schemas: Record<string, JsonSchema> = {
    Error: {
      type: 'object',
      required: ['message'],
      properties: { message: { type: 'string' }, issues: { type: 'array', items: {} } },
    },
  };
  for (const table of tables) {
    schemas[pascal(table.name)] = rowSchema(table, dialect);
  }
  for (const table of routed) {
    schemas[`${pascal(table.name)}Input`] = inputSchema(table, true, dialect);
    schemas[`${pascal(table.name)}Update`] = inputSchema(table, false, dialect);
  }

  return {
    openapi: '3.1.0',
    'x-dialect': dialect,
    info: { title: info.name, version: info.version, ...(info.description ? { description: info.description } : {}) },
    paths: Object.assign({}, ...routed.map((table: DbTable) => tablePaths(table, dialect, relations.get(table.name) ?? []))),
    components: { schemas },
  };
};

const CONVENTION: Record<Dialect, Record<string, string>> = {
  mysql: {
    integer: 'int', number: 'double', boolean: 'tinyint(1)', text: 'text', json: 'json',
    date: 'date', 'date-time': 'datetime', time: 'time', uuid: 'char(36)',
  },
  postgresql: {
    integer: 'integer', number: 'double precision', boolean: 'boolean', text: 'text', json: 'jsonb',
    date: 'date', 'date-time': 'timestamp with time zone', time: 'time without time zone', uuid: 'uuid',
  },
};

/** Picks a column type in `dialect` syntax for a JSON Schema property. */
const conventionType = (schema: JsonSchema, dialect: Dialect): string => {
  const names: Record<string, string> = CONVENTION[dialect];
  const type: string | undefined = [schema.type].flat().find((t: string) => t !== 'null');
  if (schema.enum) {
    const values: string[] = schema.enum.filter((value: unknown) => value !== null);
    return `enum(${values.map((value: string) => `'${String(value).replace(/'/g, "''")}'`).join(',')})`;
  }
  const decimal: RegExpMatchArray | null = String(schema.description ?? '').match(/^decimal\((\d+),(\d+)\)$/);
  if (decimal) {
    return `${dialect === 'mysql' ? 'decimal' : 'numeric'}(${decimal[1]},${decimal[2]})`;
  }
  if (type === 'string') {
    if (names[schema.format]) {
      return names[schema.format];
    }
    if (Number.isInteger(schema.maxLength)) {
      return dialect === 'mysql' ? `varchar(${schema.maxLength})` : `character varying(${schema.maxLength})`;
    }
    return names.text;
  }

  return names[type ?? ''] ?? names.json;
};

// A literal or a known function, with optional casts. A document can come from anyone, and the default reaches DDL.
const SAFE_DEFAULT: RegExp =
  /^(?:-?\d+(?:\.\d+)?|'(?:[^'\\]|'')*'|true|false|null|now\(\)|gen_random_uuid\(\)|current_(?:timestamp|date|time)(?:\(\d\))?)(?:::[a-z][a-z ]*(?:\(\d+(?:,\d+)?\))?(?:\[\])?)*$/i;

/**
 * Rejects SQL that can leave the parentheses Drizzle puts around it: a statement end, a comment, a control
 * character, or an unbalanced bracket or quote. A backslash means different things in each dialect and SQL mode,
 * so no expression from a document may hold one. Postgres also gets no `$` quote and no backtick.
 */
const assertSafeExpression = (expression: string, dialect: Dialect): void => {
  const unsafe = (): Error => new Error(`Unsafe expression "${expression}"`);
  const quotes: string = dialect === 'mysql' ? "'\"`" : "'\"";
  const forbidden: RegExp = dialect === 'mysql' ? /[;\\#\x00-\x1f\x7f]|--|\/\*/ : /[;\\$`\x00-\x1f\x7f]|--|\/\*/;
  let depth = 0;
  let code = '';
  for (let i = 0; i < expression.length; i++) {
    const char: string = expression[i];
    if (quotes.includes(char)) {
      const end: number = expression.indexOf(char, i + 1);
      if (end < 0 || /[\\\x00-\x1f\x7f]/.test(expression.slice(i, end))) {
        throw unsafe();
      }
      i = end;
      code += ' ';
    } else {
      depth += char === '(' ? 1 : char === ')' ? -1 : 0;
      if (depth < 0) {
        throw unsafe();
      }
      code += char;
    }
  }
  if (depth || forbidden.test(code)) {
    throw unsafe();
  }
};

const assertSafeDefaults = (tables: DbTable[]): void => {
  const unsafe: DbColumn | undefined = tables
    .flatMap((table: DbTable) => table.columns)
    .find((column: DbColumn) => column.default !== undefined && !SAFE_DEFAULT.test(column.default));
  if (unsafe) {
    throw new Error(`Unsafe default "${unsafe.default}" for column ${unsafe.name}`);
  }
};

const invalid = (): Error => new Error('Invalid x-keys: names must be strings and columns lists of strings');
const text = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw invalid();
  }
  return value;
};
const names = (value: unknown): string[] => {
  if (!Array.isArray(value) || !value.length) {
    throw invalid();
  }
  return value.map(text);
};
const action = (value: unknown): ReferentialAction | undefined => {
  if (value !== undefined && !REFERENTIAL_ACTIONS.includes(value as ReferentialAction)) {
    throw new Error(`Invalid referential action "${String(value)}"`);
  }
  return value as ReferentialAction | undefined;
};

/** `x-keys` comes from a document. Builds new keys from known fields only; actions reach DDL as they are. */
const keysFromDocument = (raw: JsonSchema): Partial<DbTable> => {
  const list = (value: unknown): JsonSchema[] => {
    if (value !== undefined && !Array.isArray(value)) {
      throw invalid();
    }
    return value ?? [];
  };
  const uniques: DbUnique[] = list(raw.uniques).map((unique: JsonSchema) => ({
    name: text(unique.name), columns: names(unique.columns), ...(unique.nullsNotDistinct === true ? { nullsNotDistinct: true as const } : {}),
  }));
  const foreignKeys: DbForeignKey[] = list(raw.foreignKeys).map((key: JsonSchema) => {
    const onDelete: ReferentialAction | undefined = action(key.onDelete);
    const onUpdate: ReferentialAction | undefined = action(key.onUpdate);
    return {
      name: text(key.name), columns: names(key.columns), table: text(key.table), foreignColumns: names(key.foreignColumns),
      ...(onDelete ? { onDelete } : {}), ...(onUpdate ? { onUpdate } : {}),
    };
  });

  return {
    ...(raw.primaryKey ? { primaryKey: { name: text(raw.primaryKey.name), columns: names(raw.primaryKey.columns) } } : {}),
    ...(uniques.length ? { uniques } : {}),
    ...(foreignKeys.length ? { foreignKeys } : {}),
  };
};

const checksFromDocument = (raw: unknown, dialect: Dialect): DbCheck[] => {
  if (raw !== undefined && !Array.isArray(raw)) {
    throw new Error('Invalid x-checks: expected a list');
  }
  return (raw ?? []).map((check: JsonSchema) => {
    const expression: string = text(check.expression);
    assertSafeExpression(expression, dialect);
    return { name: text(check.name), expression };
  });
};

type LegacyColumn = DbColumn & { primary?: boolean; unique?: boolean; references?: { table: string; column: string } };

/**
 * Generaptr 2 kept keys on each column. Moves them to the table, with the names the database gives keys it was not
 * told to name.
 */
const legacyKeys = (table: string, legacy: LegacyColumn[], dialect: Dialect): { columns: DbColumn[]; keys: Partial<DbTable> } => {
  const postgres: boolean = dialect === 'postgresql';
  const primary: string[] = legacy.filter((column: LegacyColumn) => column.primary).map((column: LegacyColumn) => column.name);
  const uniques: DbUnique[] = legacy.filter((column: LegacyColumn) => column.unique)
    .map((column: LegacyColumn) => ({ name: postgres ? `${table}_${column.name}_key` : column.name, columns: [column.name] }));
  const foreignKeys: DbForeignKey[] = legacy.filter((column: LegacyColumn) => column.references)
    .map((column: LegacyColumn, index: number) => ({
      name: postgres ? `${table}_${column.name}_fkey` : `${table}_ibfk_${index + 1}`,
      columns: [column.name],
      table: column.references?.table as string,
      foreignColumns: [column.references?.column as string],
    }));

  return {
    columns: legacy.map(({ primary: _primary, unique: _unique, references: _references, ...column }: LegacyColumn) => column),
    keys: {
      ...(primary.length ? { primaryKey: { name: postgres ? `${table}_pkey` : 'PRIMARY', columns: primary } } : {}),
      ...(uniques.length ? { uniques } : {}),
      ...(foreignKeys.length ? { foreignKeys } : {}),
    },
  };
};

/**
 * Reads tables from an OpenAPI document into `dialect`. Documents that generaptr wrote for the same
 * dialect read back exactly through `x-table` and `x-column`. Other documents map by convention.
 */
export const tablesFromOpenApi = (
  doc: { 'x-dialect'?: Dialect; components?: { schemas?: Record<string, JsonSchema> } },
  dialect: Dialect,
): DbSchema => {
  const schemas: [string, JsonSchema][] = Object.entries(doc.components?.schemas ?? {});
  const own: [string, JsonSchema][] = schemas.filter(([, schema]: [string, JsonSchema]) => schema['x-table']);
  const exact: boolean = doc['x-dialect'] === dialect;

  const tables: DbTable[] = own.length
    ? own.map(([, schema]: [string, JsonSchema]) => {
      const name: string = schema['x-table'];
      const properties: JsonSchema[] = Object.values(schema.properties as Record<string, JsonSchema>);
      const { columns, keys } = schema['x-keys']
        ? { columns: properties.map((property: JsonSchema) => property['x-column'] as DbColumn), keys: keysFromDocument(schema['x-keys']) }
        : legacyKeys(name, properties.map((property: JsonSchema) => property['x-column']), dialect);
      const converted: DbColumn[] = exact ? columns : columns.map((column: DbColumn, index: number) => {
        const { enumName, ...rest }: DbColumn = column;
        const columnType: string = conventionType(properties[index], dialect);
        const keepsEnum: boolean = dialect === 'postgresql' && columnType.startsWith('enum(');
        return { ...rest, columnType, ...(keepsEnum ? { enumName: enumName ?? `${name}_${column.name}` } : {}) };
      });
      const primaryKey = !exact && keys.primaryKey
        ? { ...keys.primaryKey, name: dialect === 'mysql' ? 'PRIMARY' : keys.primaryKey.name === 'PRIMARY' ? `${name}_pkey` : keys.primaryKey.name }
        : keys.primaryKey;
      // A CHECK expression is SQL in the document's dialect; another dialect cannot run it.
      const checks: DbCheck[] = exact ? checksFromDocument(schema['x-checks'], dialect) : [];
      return { name, columns: converted, ...keys, ...(primaryKey ? { primaryKey } : {}), ...(checks.length ? { checks } : {}) };
    })
    : schemas
      .filter(([, schema]: [string, JsonSchema]) => schema.type === 'object' && schema.properties)
      .map(([name, schema]: [string, JsonSchema]) => {
        const { columns, keys } = legacyKeys(name, Object.entries(schema.properties as Record<string, JsonSchema>)
          .map(([key, property]: [string, JsonSchema]) => {
            const required: boolean = (schema.required ?? []).includes(key);
            const primary: boolean = key === 'id';
            const columnType: string = conventionType(property, dialect);

            return {
              name: key,
              columnType,
              ...(dialect === 'postgresql' && columnType.startsWith('enum(') ? { enumName: `${name}_${key}` } : {}),
              nullable: !required || [property.type].flat().includes('null'),
              primary,
              autoIncrement: primary && columnType === CONVENTION[dialect].integer,
            };
          }), dialect);
        return { name, columns, ...keys };
      });
  assertSafeNames(tables);
  assertSafeDefaults(tables);

  return { dialect, tables };
};
