import * as path from 'node:path';
import { Eta } from 'eta';
import {
  assertSafeNames, camel, SAFE_COLLATION, type ParsedType, parseColumnType, primaryColumns, routedTables, routePath,
} from '../../commons/columns.js';
import { type Relation, routedRelations } from '../../commons/relations.js';
import {
  DbColumn, DbIdentity, DbSchema, DbSequence, DbTable, Dialect, PackageJsonInfo, REFERENTIAL_ACTIONS, ReferentialAction,
} from '../../commons/types.js';
import { openApiDocument } from '../spec/openapi.js';

export { routedTables };

/** Versions the generated API installs. Drizzle v1 is a release candidate: pin it exactly. */
export const VERSIONS: Record<string, string> = {
  express: '5.3.0',
  'drizzle-orm': '1.0.0-rc.5',
  zod: '4.6.7',
  'drizzle-kit': '1.0.0-rc.5',
  mysql2: '3.24.6',
  pg: '8.23.1',
};

/** Everything that differs between the dialects of the generated API. */
const DIALECTS: Record<Dialect, {
  core: string;
  table: string;
  driver: string;
  driverPackage: string;
  url: string;
  returning: (entity: string, key: string) => string;
}> = {
  mysql: {
    core: 'mysql-core',
    table: 'mysqlTable',
    driver: 'mysql2',
    driverPackage: 'mysql2',
    url: 'mysql://user:password@127.0.0.1:3306/database',
    returning: () => '$returningId()',
  },
  postgresql: {
    core: 'pg-core',
    table: 'pgTable',
    driver: 'node-postgres',
    driverPackage: 'pg',
    url: 'postgres://user:password@127.0.0.1:5432/database',
    returning: (entity: string, key: string) => `returning({ ${key}: ${entity}.${key} })`,
  },
};

/** Postgres enums are types of their own: the column calls the enum declared by `pgEnum`. */
const enumVariable = (column: DbColumn, table: DbTable): string =>
  `${camel(column.enumName ?? `${table.name}_${column.name}`)}Enum`;

/** A Drizzle `customType` per SQL type that has no builder. Binary types carry base64 in JSON. */
export type CustomTypes = Map<string, { name: string; binary: boolean }>;

const customVariable = (sql: string, binary: boolean, customs: CustomTypes): string => {
  const known = customs.get(sql);
  if (known) {
    return known.name;
  }
  const base: string = `${camel(sql.toLowerCase().replace(/\[\]/g, ' array').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''))}Type`;
  const taken: Set<string> = new Set([...customs.values()].map((custom: { name: string }) => custom.name));
  let name: string = base;
  for (let n = 2; taken.has(name); n++) {
    name = `${base}${n}`;
  }
  customs.set(sql, { name, binary });
  return name;
};

const scalarBuilder = (
  type: ParsedType,
  column: DbColumn,
  dialect: Dialect,
  table: DbTable,
  customs: CustomTypes,
): { builder?: string; call: string } => {
  const name: string = JSON.stringify(column.name);
  const postgres: boolean = dialect === 'postgresql';
  switch (type.kind) {
    case 'binary':
    case 'custom':
      return { call: `${customVariable(type.sql, type.kind === 'binary', customs)}(${name})` };
    case 'boolean':
      return { builder: 'boolean', call: `boolean(${name})` };
    case 'enum':
      return postgres
        ? { call: `${enumVariable(column, table)}(${name})` }
        : { builder: 'mysqlEnum', call: `mysqlEnum(${name}, ${JSON.stringify(type.values)})` };
    case 'decimal': {
      const builder: string = postgres ? 'numeric' : 'decimal';
      return { builder, call: `${builder}(${name}, { precision: ${type.precision}, scale: ${type.scale} })` };
    }
    case 'sized':
      return { builder: type.base, call: `${type.base}(${name}, { length: ${type.length} })` };
    case 'plain': {
      const builder: string = type.base === 'timestamptz' ? 'timestamp' : type.base;
      const options: string[] = [
        ...(type.base === 'timestamptz' ? ['withTimezone: true'] : []),
        ...(type.precision === undefined ? [] : [`${postgres ? 'precision' : 'fsp'}: ${type.precision}`]),
      ];
      return { builder, call: `${builder}(${name}${options.length ? `, { ${options.join(', ')} }` : ''})` };
    }
    case 'integer': {
      if (postgres) {
        const serials: Record<string, string> = { smallint: 'smallserial', integer: 'serial', bigint: 'bigserial' };
        const builder: string = column.autoIncrement ? serials[type.base] : type.base;
        return { builder, call: `${builder}(${name}${type.base === 'bigint' ? ", { mode: 'number' }" : ''})` };
      }
      if (type.base === 'bigint') {
        return { builder: 'bigint', call: `bigint(${name}, { mode: 'number'${type.unsigned ? ', unsigned: true' : ''} })` };
      }
      if (type.base === 'year') {
        return { builder: 'year', call: `year(${name})` };
      }
      return { builder: type.base, call: `${type.base}(${name}${type.unsigned ? ', { unsigned: true }' : ''})` };
    }
  }
};

/**
 * Returns the Drizzle call for one column, plus the `drizzle-orm/<core>` builder it imports.
 * A Postgres enum column imports nothing: it calls its `pgEnum` declaration.
 */
export const columnBuilder = (
  column: DbColumn,
  dialect: Dialect = 'mysql',
  table: DbTable = { name: '', columns: [] },
  customs: CustomTypes = new Map(),
): { builder?: string; call: string } => {
  const type: ParsedType = parseColumnType(column, dialect);
  const { builder, call } = scalarBuilder(type, column, dialect, table, customs);

  return { builder, call: type.array ? `${call}.array()` : call };
};

const eta: Eta = new Eta({
  views: path.resolve(import.meta.dirname, '../../../templates/api'),
  autoEscape: false,
  autoTrim: false,
});

/** The name Postgres gives a primary key it was not told to name. Drizzle's `.primaryKey()` gives the same. */
const inlinePrimaryKey = (table: DbTable, dialect: Dialect): boolean =>
  table.primaryKey?.columns.length === 1 && (dialect === 'mysql' || table.primaryKey.name === `${table.name}_pkey`);

const sequenceOptions = ({ start, increment, min, max, cache, cycle }: DbSequence): string => [
  `startWith: ${JSON.stringify(start)}`, `increment: ${JSON.stringify(increment)}`,
  `minValue: ${JSON.stringify(min)}`, `maxValue: ${JSON.stringify(max)}`, `cache: ${JSON.stringify(cache)}`,
  ...(cycle ? ['cycle: true'] : []),
].join(', ');

const identityCall = (identity: DbIdentity): string =>
  `.generated${identity.always ? 'Always' : 'ByDefault'}AsIdentity({ name: ${JSON.stringify(identity.name)}, ${sequenceOptions(identity)} })`;

const chainFor = (column: DbColumn, table: DbTable, schema: DbSchema, customs: CustomTypes): string => {
  const mysql: boolean = schema.dialect === 'mysql';
  let chain: string = columnBuilder(column, schema.dialect, table, customs).call;
  if (column.collation !== undefined && mysql) {
    if (!SAFE_COLLATION.test(column.collation)) {
      throw new Error(`Unsafe collation "${column.collation}" for column ${column.name}`);
    }
    chain += `.collate(${JSON.stringify(column.collation)})`;
  }
  if (column.autoIncrement && mysql) {
    chain += '.autoincrement()';
  }
  if (column.identity) {
    chain += identityCall(column.identity);
  }
  if (inlinePrimaryKey(table, schema.dialect) && table.primaryKey?.columns[0] === column.name) {
    chain += '.primaryKey()';
  } else if (!column.nullable) {
    chain += '.notNull()';
  }
  if (column.default !== undefined) {
    chain += `.default(sql.raw(${JSON.stringify(column.default)}))`;
  }
  if (column.onUpdateNow) {
    const type: ParsedType = parseColumnType(column, schema.dialect);
    chain += `.onUpdateNow(${type.kind === 'plain' && type.precision ? `{ fsp: ${type.precision} }` : ''})`;
  }
  if (column.generated) {
    if (column.generated.virtual && !mysql) {
      throw new Error(`Unsupported column ${column.name}: Drizzle has no virtual generated column for Postgres`);
    }
    chain += `.generatedAlwaysAs(sql.raw(${JSON.stringify(column.generated.expression)})${column.generated.virtual ? ", { mode: 'virtual' }" : mysql ? ", { mode: 'stored' }" : ''})`;
  }

  return chain;
};

/** Table-level constraints, each with the name the database gave it. Builders that they import go to `builders`. */
const constraintsFor = (table: DbTable, dialect: Dialect, builders: Set<string>): string[] => {
  const columns = (names: string[], owner: string): string => names.map((name: string) => `${owner}.${camel(name)}`).join(', ');
  const constraints: string[] = [];
  if (table.primaryKey && !inlinePrimaryKey(table, dialect)) {
    builders.add('primaryKey');
    // MySQL names every primary key PRIMARY.
    const name: string = dialect === 'mysql' ? '' : `name: ${JSON.stringify(table.primaryKey.name)}, `;
    constraints.push(`primaryKey({ ${name}columns: [${columns(table.primaryKey.columns, 'table')}] })`);
  }
  for (const unique of table.uniques ?? []) {
    builders.add('unique');
    constraints.push(`unique(${JSON.stringify(unique.name)}).on(${columns(unique.columns, 'table')})${unique.nullsNotDistinct ? '.nullsNotDistinct()' : ''}`);
  }
  for (const key of table.foreignKeys ?? []) {
    // Drizzle writes the action into DDL as it is.
    const unsafe: unknown = [key.onDelete, key.onUpdate]
      .find((value: unknown) => value !== undefined && !REFERENTIAL_ACTIONS.includes(value as ReferentialAction));
    if (unsafe !== undefined) {
      throw new Error(`Invalid referential action "${String(unsafe)}"`);
    }
    builders.add('foreignKey');
    const target: string = key.table === table.name ? 'table' : camel(key.table);
    constraints.push(`foreignKey({ name: ${JSON.stringify(key.name)}, columns: [${columns(key.columns, 'table')}], `
      + `foreignColumns: [${columns(key.foreignColumns, target)}] })`
      + `${key.onDelete ? `.onDelete(${JSON.stringify(key.onDelete)})` : ''}${key.onUpdate ? `.onUpdate(${JSON.stringify(key.onUpdate)})` : ''}`);
  }
  for (const index of table.indexes ?? []) {
    const builder: string = index.unique ? 'uniqueIndex' : 'index';
    builders.add(builder);
    const keys: string = index.keys.map((key: string) => `sql.raw(${JSON.stringify(key)})`).join(', ');
    constraints.push(`${builder}(${JSON.stringify(index.name)})`
      + (index.method ? `.using(${JSON.stringify(index.method)}, ${keys})` : `.on(${keys})`)
      + (index.where ? `.where(sql.raw(${JSON.stringify(index.where)}))` : '')
      + (index.with ? `.with(${JSON.stringify(index.with)})` : ''));
  }
  for (const check of table.checks ?? []) {
    builders.add('check');
    constraints.push(`check(${JSON.stringify(check.name)}, sql.raw(${JSON.stringify(check.expression)}))`);
  }

  return constraints;
};

export const schemaFile = (schema: DbSchema): string => {
  const { core, table: tableFunction } = DIALECTS[schema.dialect];
  const builders: Set<string> = new Set([tableFunction]);
  const enums: Map<string, { name: string; type: string; values: string }> = new Map();
  const customs: CustomTypes = new Map();
  for (const item of schema.enums ?? []) {
    enums.set(`${camel(item.name)}Enum`, { name: `${camel(item.name)}Enum`, type: JSON.stringify(item.name), values: JSON.stringify(item.values) });
  }
  const sequences = (schema.sequences ?? []).map((sequence: DbSequence) => ({
    name: `${camel(sequence.name)}Sequence`, sql: JSON.stringify(sequence.name), options: sequenceOptions(sequence),
  }));
  if (enums.size) {
    builders.add('pgEnum');
  }
  if (sequences.length) {
    builders.add('pgSequence');
  }
  const views = schema.tables.map((table: DbTable) => {
    for (const column of table.columns) {
      const { builder } = columnBuilder(column, schema.dialect, table, customs);
      if (builder) {
        builders.add(builder);
      }
      const type: ParsedType = parseColumnType(column, schema.dialect);
      if (!builder && type.kind === 'enum') {
        builders.add('pgEnum');
        const name: string = enumVariable(column, table);
        enums.set(name, {
          name,
          type: JSON.stringify(column.enumName ?? `${table.name}_${column.name}`),
          values: JSON.stringify(type.values),
        });
      }
    }

    return {
      name: camel(table.name),
      table: JSON.stringify(table.name),
      columns: table.columns.map((column: DbColumn) => ({ key: camel(column.name), chain: chainFor(column, table, schema, customs) })),
      constraints: constraintsFor(table, schema.dialect, builders),
    };
  });

  return eta.render('src/db/schema.js.eta', {
    usesSql: schema.tables.some((table: DbTable) => table.checks?.length || table.indexes?.length
      || table.columns.some((column: DbColumn) => column.default !== undefined || column.generated)),
    builders: [...builders, ...(customs.size ? ['customType'] : [])].sort().join(', '),
    customs: [...customs.entries()].map(([sql, custom]: [string, { name: string; binary: boolean }]) => ({ ...custom, sql: JSON.stringify(sql) })),
    core,
    tableFunction,
    enums: [...enums.values()],
    sequences,
    tables: views,
  });
};

export const routeFile = (table: DbTable, dialect: Dialect, relations: Relation[] = []): string => {
  const [primary] = primaryColumns(table);
  const entity: string = camel(table.name);
  const key: string = camel(primary.name);

  return eta.render('src/routes/route.js.eta', {
    entity,
    key,
    id: parseColumnType(primary, dialect).kind === 'integer' ? 'Number(req.params.id)' : 'req.params.id',
    returning: DIALECTS[dialect].returning(entity, key),
    // A nested list returns at most 100 rows, as the list route does.
    includes: JSON.stringify(Object.fromEntries(relations.map((relation: Relation) =>
      [relation.name, relation.kind === 'many' ? { limit: 100 } : true]))),
  });
};

/** `src/db/relations.js`: both sides of every foreign key, for `?with=` on the routes. */
export const relationsFile = (tables: DbTable[]): string => {
  const column = (table: string, name: string): string => `r.${camel(table)}.${camel(name)}`;
  const call = (source: string, relation: Relation): string => {
    const from: string = column(source, relation.from);
    const to: string = column(relation.target, relation.to);
    const ends: string = relation.through
      ? `from: ${from}.through(${column(relation.through.table, relation.through.from)}), `
        + `to: ${to}.through(${column(relation.through.table, relation.through.to)})`
      : `from: ${from}, to: ${to}`;

    return `r.${relation.kind}.${camel(relation.target)}({ ${ends} })`;
  };

  return eta.render('src/db/relations.js.eta', {
    tables: [...routedRelations(tables)]
      .filter(([, relations]: [string, Relation[]]) => relations.length)
      .map(([table, relations]: [string, Relation[]]) => ({
        name: camel(table),
        relations: relations.map((relation: Relation) => ({ name: relation.name, call: call(table, relation) })),
      })),
  });
};

export const appFile = (tables: DbTable[]): string =>
  eta.render('src/app.js.eta', {
    routes: routedTables(tables).map((table: DbTable) => ({ name: camel(table.name), path: routePath(table) })),
  });

export const packageJson = (info: PackageJsonInfo, dialect: Dialect): string => {
  const { express, 'drizzle-orm': drizzleOrm, zod, 'drizzle-kit': drizzleKit } = VERSIONS;
  const driver: string = DIALECTS[dialect].driverPackage;

  return `${JSON.stringify({
    name: info.name,
    version: info.version,
    description: info.description,
    author: info.author,
    license: info.license,
    private: true,
    type: 'module',
    engines: { node: '>=22' },
    scripts: {
      start: 'node --env-file-if-exists=.env src/index.js',
      dev: 'node --env-file-if-exists=.env --watch src/index.js',
      'db:generate': 'drizzle-kit generate',
      'db:migrate': 'drizzle-kit migrate',
      'db:baseline': 'drizzle-kit generate && node --env-file-if-exists=.env scripts/baseline.js',
    },
    dependencies: { express, 'drizzle-orm': drizzleOrm, [driver]: VERSIONS[driver], zod },
    devDependencies: { 'drizzle-kit': drizzleKit },
  }, undefined, 2)}\n`;
};

/** Every file of the generated API, keyed by path relative to the output directory. */
export const renderApi = (schema: DbSchema, info: PackageJsonInfo): Record<string, string> => {
  assertSafeNames(schema);
  const dialect = DIALECTS[schema.dialect];
  const files: Record<string, string> = {
    'package.json': packageJson(info, schema.dialect),
    '.gitignore': eta.render('gitignore.eta', {}),
    '.env.example': eta.render('env.example.eta', { url: dialect.url }),
    'drizzle.config.js': eta.render('drizzle.config.js.eta', { dialect: schema.dialect }),
    'src/index.js': eta.render('src/index.js.eta', {}),
    'src/app.js': appFile(schema.tables),
    'src/db/index.js': eta.render('src/db/index.js.eta', { driver: dialect.driver }),
    'scripts/baseline.js': eta.render('scripts/baseline.js.eta', { driver: dialect.driver }),
    'src/db/schema.js': schemaFile(schema),
    'src/db/relations.js': relationsFile(schema.tables),
    'openapi.json': `${JSON.stringify(openApiDocument(schema, info), undefined, 2)}\n`,
  };
  const relations: Map<string, Relation[]> = routedRelations(schema.tables);
  for (const table of routedTables(schema.tables)) {
    files[`src/routes/${camel(table.name)}.js`] = routeFile(table, schema.dialect, relations.get(table.name));
  }

  return files;
};
