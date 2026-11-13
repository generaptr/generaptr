import * as path from 'node:path';
import { Eta } from 'eta';
import {
  assertSafeNames, camel, type ParsedType, parseColumnType, primaryColumns, routedTables, routePath,
} from '../../commons/columns';
import { DbColumn, DbTable, PackageJsonInfo } from '../../commons/types';
import { openApiDocument } from '../spec/openapi';

export { routedTables };

/** Versions the generated API installs. Drizzle v1 is beta: pin it exactly. */
export const VERSIONS: Record<string, string> = {
  express: '5.3.0',
  'drizzle-orm': '1.0.0-beta.22',
  mysql2: '3.24.6',
  zod: '4.6.7',
  'drizzle-kit': '1.0.0-beta.22',
};

/** Returns the Drizzle builder name and its call for one MySQL column. */
export const columnBuilder = (column: DbColumn): { builder: string; call: string } => {
  const type: ParsedType = parseColumnType(column);
  const name: string = JSON.stringify(column.name);
  switch (type.kind) {
    case 'boolean':
      return { builder: 'boolean', call: `boolean(${name})` };
    case 'enum':
      return { builder: 'mysqlEnum', call: `mysqlEnum(${name}, ${JSON.stringify(type.values)})` };
    case 'decimal':
      return { builder: 'decimal', call: `decimal(${name}, { precision: ${type.precision}, scale: ${type.scale} })` };
    case 'sized':
      return { builder: type.base, call: `${type.base}(${name}, { length: ${type.length} })` };
    case 'plain':
      return { builder: type.base, call: `${type.base}(${name})` };
    case 'integer': {
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

const eta: Eta = new Eta({
  views: path.resolve(__dirname, '../../../templates/api'),
  autoEscape: false,
  autoTrim: false,
});

const chainFor = (column: DbColumn, table: DbTable, tables: DbTable[]): string => {
  let chain: string = columnBuilder(column).call;
  if (column.autoIncrement) {
    chain += '.autoincrement()';
  }
  if (column.primary && primaryColumns(table).length === 1) {
    chain += '.primaryKey()';
  } else if (!column.nullable) {
    chain += '.notNull()';
  }
  if (column.unique) {
    chain += '.unique()';
  }
  const target: DbTable | undefined = tables.find((t: DbTable) => t.name === column.references?.table);
  if (column.references && target) {
    chain += `.references(() => ${camel(target.name)}.${camel(column.references.column)})`;
  }

  return chain;
};

export const schemaFile = (tables: DbTable[]): string => {
  const builders: Set<string> = new Set(['mysqlTable']);
  const views = tables.map((table: DbTable) => {
    const primary: DbColumn[] = primaryColumns(table);
    for (const column of table.columns) {
      builders.add(columnBuilder(column).builder);
    }
    if (primary.length > 1) {
      builders.add('primaryKey');
    }

    return {
      name: camel(table.name),
      table: JSON.stringify(table.name),
      columns: table.columns.map((column: DbColumn) => ({ key: camel(column.name), chain: chainFor(column, table, tables) })),
      primaryKeys: primary.length > 1 ? primary.map((column: DbColumn) => `table.${camel(column.name)}`).join(', ') : '',
    };
  });

  return eta.render('src/db/schema.js.eta', { builders: [...builders].sort().join(', '), tables: views });
};

export const routeFile = (table: DbTable): string => {
  const [primary] = primaryColumns(table);

  return eta.render('src/routes/route.js.eta', {
    entity: camel(table.name),
    key: camel(primary.name),
    id: parseColumnType(primary).kind === 'integer' ? 'Number(req.params.id)' : 'req.params.id',
  });
};

export const appFile = (tables: DbTable[]): string =>
  eta.render('src/app.js.eta', {
    routes: routedTables(tables).map((table: DbTable) => ({ name: camel(table.name), path: routePath(table) })),
  });

export const packageJson = (info: PackageJsonInfo): string => {
  const { 'drizzle-kit': drizzleKit, ...dependencies } = VERSIONS;

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
    },
    dependencies,
    devDependencies: { 'drizzle-kit': drizzleKit },
  }, undefined, 2)}\n`;
};

/** Every file of the generated API, keyed by path relative to the output directory. */
export const renderApi = (tables: DbTable[], info: PackageJsonInfo): Record<string, string> => {
  assertSafeNames(tables);
  const files: Record<string, string> = {
    'package.json': packageJson(info),
    '.gitignore': eta.render('gitignore.eta', {}),
    '.env.example': eta.render('env.example.eta', {}),
    'drizzle.config.js': eta.render('drizzle.config.js.eta', {}),
    'src/index.js': eta.render('src/index.js.eta', {}),
    'src/app.js': appFile(tables),
    'src/db/index.js': eta.render('src/db/index.js.eta', {}),
    'src/db/schema.js': schemaFile(tables),
    'openapi.json': `${JSON.stringify(openApiDocument(tables, info), undefined, 2)}\n`,
  };
  for (const table of routedTables(tables)) {
    files[`src/routes/${camel(table.name)}.js`] = routeFile(table);
  }

  return files;
};
