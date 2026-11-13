import {
  assertSafeNames, camel, type ParsedType, parseColumnType, pascal, primaryColumns, routedTables, routePath,
} from '../../commons/columns';
import { DbColumn, DbSchema, DbTable, Dialect, PackageJsonInfo } from '../../commons/types';

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

const rowSchema = (table: DbTable, dialect: Dialect): JsonSchema => ({
  type: 'object',
  'x-table': table.name,
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

const tablePaths = (table: DbTable, dialect: Dialect): Record<string, Record<string, unknown>> => {
  const name: string = pascal(table.name);
  const [primary] = primaryColumns(table);
  const idParameter: JsonSchema = {
    name: 'id', in: 'path', required: true, schema: baseSchema(parseColumnType(primary, dialect)),
  };
  const query = (param: string, description: string): JsonSchema => ({
    name: param, in: 'query', required: false, description, schema: { type: 'integer', minimum: 0 },
  });

  return {
    [routePath(table)]: {
      get: {
        operationId: `list${name}`,
        parameters: [query('limit', 'Rows to return, at most 100. Default 20.'), query('offset', 'Rows to skip.')],
        responses: { 200: { description: `A page of ${table.name}`, ...json({ type: 'array', items: ref(name) }) } },
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
        responses: { 200: { description: 'Found', ...json(ref(name)) }, 404: errorResponse('Not found') },
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
    paths: Object.assign({}, ...routed.map((table: DbTable) => tablePaths(table, dialect))),
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
    ? own.map(([, schema]: [string, JsonSchema]) => ({
      name: schema['x-table'],
      columns: Object.values(schema.properties as Record<string, JsonSchema>).map((property: JsonSchema) => {
        if (exact) {
          return property['x-column'];
        }
        const { enumName, ...column }: DbColumn = property['x-column'];
        const columnType: string = conventionType(property, dialect);
        const keepsEnum: boolean = dialect === 'postgresql' && columnType.startsWith('enum(');
        return { ...column, columnType, ...(keepsEnum ? { enumName: enumName ?? `${schema['x-table']}_${column.name}` } : {}) };
      }),
    }))
    : schemas
      .filter(([, schema]: [string, JsonSchema]) => schema.type === 'object' && schema.properties)
      .map(([name, schema]: [string, JsonSchema]) => ({
        name,
        columns: Object.entries(schema.properties as Record<string, JsonSchema>).map(([key, property]: [string, JsonSchema]) => {
          const required: boolean = (schema.required ?? []).includes(key);
          const primary: boolean = key === 'id';
          const columnType: string = conventionType(property, dialect);

          return {
            name: key,
            columnType,
            ...(dialect === 'postgresql' && columnType.startsWith('enum(') ? { enumName: `${name}_${key}` } : {}),
            nullable: !required || [property.type].flat().includes('null'),
            primary,
            unique: false,
            autoIncrement: primary && columnType === CONVENTION[dialect].integer,
          };
        }),
      }));
  assertSafeNames(tables);

  return { dialect, tables };
};
