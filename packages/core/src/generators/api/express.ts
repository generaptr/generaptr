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

export const schemaFile = (tables: DbTable[]): string => {
  const builders: Set<string> = new Set(['mysqlTable']);
  const blocks: string[] = tables.map((table: DbTable) => {
    const primary: DbColumn[] = primaryColumns(table);
    const lines: string[] = table.columns.map((column: DbColumn) => {
      const { builder, call } = columnBuilder(column);
      builders.add(builder);
      let chain: string = call;
      if (column.autoIncrement) {
        chain += '.autoincrement()';
      }
      if (column.primary && primary.length === 1) {
        chain += '.primaryKey()';
      } else if (!column.nullable) {
        chain += '.notNull()';
      }
      if (column.unique) {
        chain += '.unique()';
      }
      if (column.references) {
        const target: DbTable | undefined = tables.find((t: DbTable) => t.name === column.references?.table);
        if (target) {
          chain += `.references(() => ${camel(target.name)}.${camel(column.references.column)})`;
        }
      }

      return `  ${camel(column.name)}: ${chain},`;
    });
    let extra: string = '';
    if (primary.length > 1) {
      builders.add('primaryKey');
      const keys: string = primary.map((column: DbColumn) => `table.${camel(column.name)}`).join(', ');
      extra = `, (table) => [primaryKey({ columns: [${keys}] })]`;
    }

    return `export const ${camel(table.name)} = mysqlTable(${JSON.stringify(table.name)}, {\n${lines.join('\n')}\n}${extra});\n`;
  });

  return `import { ${[...builders].sort().join(', ')} } from 'drizzle-orm/mysql-core';\n\n${blocks.join('\n')}`;
};

export const routeFile = (table: DbTable): string => {
  const entity: string = camel(table.name);
  const [primary] = primaryColumns(table);
  const key: string = camel(primary.name);
  const id: string = parseColumnType(primary).kind === 'integer' ? 'Number(req.params.id)' : 'req.params.id';

  return `import { eq } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { Router } from 'express';
import { db } from '../db/index.js';
import { ${entity} } from '../db/schema.js';

const insertSchema = createInsertSchema(${entity});
const updateSchema = createUpdateSchema(${entity});
const byId = (req) => eq(${entity}.${key}, ${id});

export const router = Router();

router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  res.json(await db.select().from(${entity}).limit(limit).offset(offset));
});

router.get('/:id', async (req, res) => {
  const [row] = await db.select().from(${entity}).where(byId(req));
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json(row);
});

router.post('/', async (req, res) => {
  const [created] = await db.insert(${entity}).values(insertSchema.parse(req.body)).$returningId();
  res.status(201).location(\`\${req.baseUrl}/\${created.${key}}\`).json(created);
});

router.put('/:id', async (req, res) => {
  await db.update(${entity}).set(updateSchema.parse(req.body)).where(byId(req));
  res.status(204).end();
});

router.delete('/:id', async (req, res) => {
  await db.delete(${entity}).where(byId(req));
  res.status(204).end();
});
`;
};

export const appFile = (tables: DbTable[]): string => {
  const routed: DbTable[] = routedTables(tables);
  const imports: string = routed
    .map((table: DbTable) => `import { router as ${camel(table.name)} } from './routes/${camel(table.name)}.js';`)
    .join('\n');
  const mounts: string = routed
    .map((table: DbTable) => `app.use('${routePath(table)}', ${camel(table.name)});`)
    .join('\n');

  return `import express from 'express';
import { ZodError } from 'zod';
${imports}

export const app = express();

app.use(express.json());
${mounts}

app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Invalid request body', issues: err.issues });
  }
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});
`;
};

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
    '.gitignore': 'node_modules\n.env\n',
    '.env.example': 'DATABASE_URL=mysql://user:password@127.0.0.1:3306/database\nPORT=3000\n',
    'drizzle.config.js': `import { defineConfig } from 'drizzle-kit';

try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema.js',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL },
});
`,
    'src/index.js': `import { app } from './app.js';

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(\`Listening on port \${port}\`));
`,
    'src/app.js': appFile(tables),
    'src/db/index.js': `import { drizzle } from 'drizzle-orm/mysql2';

export const db = drizzle(process.env.DATABASE_URL);
`,
    'src/db/schema.js': schemaFile(tables),
    'openapi.json': `${JSON.stringify(openApiDocument(tables, info), undefined, 2)}\n`,
  };
  for (const table of routedTables(tables)) {
    files[`src/routes/${camel(table.name)}.js`] = routeFile(table);
  }

  return files;
};
