import {
  assertSafeNames, camel, type ParsedType, parseColumnType, pascal, primaryColumns, routedTables, routePath,
} from '../../commons/columns';
import { DbColumn, DbTable, PackageJsonInfo } from '../../commons/types';

// razor: plain objects typed loosely; switch to `openapi-types` if callers need deep typing.
type JsonSchema = Record<string, any>;
export type OpenApiDocument = {
  openapi: string;
  info: { title: string; version: string; description?: string };
  paths: Record<string, Record<string, unknown>>;
  components: { schemas: Record<string, JsonSchema> };
};

const baseSchema = (type: ParsedType): JsonSchema => {
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
      const formats: Record<string, string> = { date: 'date', datetime: 'date-time', timestamp: 'date-time', time: 'time' };
      if (type.base === 'float' || type.base === 'double') {
        return { type: 'number' };
      }
      if (type.base === 'json') {
        return {};
      }
      return formats[type.base] ? { type: 'string', format: formats[type.base] } : { type: 'string' };
    }
  }
};

const propertySchema = (column: DbColumn): JsonSchema => {
  const schema: JsonSchema = baseSchema(parseColumnType(column));
  if (!column.nullable || schema.type === undefined) {
    return schema;
  }

  return { ...schema, type: [schema.type, 'null'], ...(schema.enum ? { enum: [...schema.enum, null] } : {}) };
};

const rowSchema = (table: DbTable): JsonSchema => ({
  type: 'object',
  'x-table': table.name,
  required: table.columns.map((column: DbColumn) => camel(column.name)),
  properties: Object.fromEntries(table.columns.map((column: DbColumn) => [
    camel(column.name),
    { ...propertySchema(column), 'x-column': { ...column } },
  ])),
});

const writable = (table: DbTable): DbColumn[] => table.columns.filter((column: DbColumn) => !column.autoIncrement);

const inputSchema = (table: DbTable, requireColumns: boolean): JsonSchema => ({
  type: 'object',
  additionalProperties: false,
  ...(requireColumns ? {
    required: writable(table).filter((column: DbColumn) => !column.nullable).map((column: DbColumn) => camel(column.name)),
  } : {}),
  properties: Object.fromEntries(writable(table).map((column: DbColumn) => [camel(column.name), propertySchema(column)])),
});

const ref = (name: string): JsonSchema => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: JsonSchema): JsonSchema => ({ content: { 'application/json': { schema } } });
const errorResponse = (description: string): JsonSchema => ({ description, ...json(ref('Error')) });

const tablePaths = (table: DbTable): Record<string, Record<string, unknown>> => {
  const name: string = pascal(table.name);
  const [primary] = primaryColumns(table);
  const idParameter: JsonSchema = {
    name: 'id', in: 'path', required: true, schema: baseSchema(parseColumnType(primary)),
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
export const openApiDocument = (tables: DbTable[], info: Omit<PackageJsonInfo, 'author' | 'license'>): OpenApiDocument => {
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
    schemas[pascal(table.name)] = rowSchema(table);
  }
  for (const table of routed) {
    schemas[`${pascal(table.name)}Input`] = inputSchema(table, true);
    schemas[`${pascal(table.name)}Update`] = inputSchema(table, false);
  }

  return {
    openapi: '3.1.0',
    info: { title: info.name, version: info.version, ...(info.description ? { description: info.description } : {}) },
    paths: Object.assign({}, ...routed.map(tablePaths)),
    components: { schemas },
  };
};

const columnType = (schema: JsonSchema): string => {
  const type: string | undefined = [schema.type].flat().find((t: string) => t !== 'null');
  if (schema.enum) {
    const values: string[] = schema.enum.filter((value: unknown) => value !== null);
    return `enum(${values.map((value: string) => `'${String(value).replace(/'/g, "''")}'`).join(',')})`;
  }
  switch (type) {
    case 'integer':
      return 'int';
    case 'number':
      return 'double';
    case 'boolean':
      return 'tinyint(1)';
    case 'string': {
      const formats: Record<string, string> = { date: 'date', 'date-time': 'datetime', time: 'time' };
      if (formats[schema.format]) {
        return formats[schema.format];
      }
      return Number.isInteger(schema.maxLength) ? `varchar(${schema.maxLength})` : 'text';
    }
    default:
      return 'json';
  }
};

/**
 * Reads tables from an OpenAPI document. Documents that generaptr wrote carry `x-table` and
 * `x-column` and read back exactly. Other documents map each object schema to a table by convention.
 */
export const tablesFromOpenApi = (doc: { components?: { schemas?: Record<string, JsonSchema> } }): DbTable[] => {
  const schemas: [string, JsonSchema][] = Object.entries(doc.components?.schemas ?? {});
  const own: [string, JsonSchema][] = schemas.filter(([, schema]: [string, JsonSchema]) => schema['x-table']);
  if (own.length) {
    return own.map(([, schema]: [string, JsonSchema]) => ({
      name: schema['x-table'],
      columns: Object.values(schema.properties as Record<string, JsonSchema>).map((p: JsonSchema) => p['x-column']),
    }));
  }

  const tables: DbTable[] = schemas
    .filter(([, schema]: [string, JsonSchema]) => schema.type === 'object' && schema.properties)
    .map(([name, schema]: [string, JsonSchema]) => ({
      name,
      columns: Object.entries(schema.properties as Record<string, JsonSchema>).map(([key, property]: [string, JsonSchema]) => {
        const required: boolean = (schema.required ?? []).includes(key);
        const primary: boolean = key === 'id';
        const type: string = columnType(property);

        return {
          name: key,
          columnType: type,
          nullable: !required || [property.type].flat().includes('null'),
          primary,
          unique: false,
          autoIncrement: primary && type === 'int',
        };
      }),
    }));
  assertSafeNames(tables);

  return tables;
};
