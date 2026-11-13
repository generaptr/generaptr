import { DbColumn, DbTable, PackageJsonInfo } from '../../commons/types';

/** Versions the generated API installs. Drizzle v1 is beta: pin it exactly. */
export const VERSIONS: Record<string, string> = {
  express: '5.3.0',
  'drizzle-orm': '1.0.0-beta.22',
  mysql2: '3.24.6',
  zod: '4.6.7',
  'drizzle-kit': '1.0.0-beta.22',
};

const camel = (name: string): string => name.replace(/[_\-\s]+(\w)/g, (_: string, c: string) => c.toUpperCase());

const NUMERIC: string[] = ['tinyint', 'smallint', 'mediumint', 'int', 'integer', 'bigint', 'decimal', 'float', 'double', 'year'];
const SIZED: string[] = ['varchar', 'char', 'binary', 'varbinary'];
const PLAIN: string[] = [
  'text', 'tinytext', 'mediumtext', 'longtext', 'blob', 'tinyblob', 'mediumblob', 'longblob',
  'date', 'datetime', 'timestamp', 'time', 'year', 'json', 'float', 'double',
];

const unsupported = (column: DbColumn): Error =>
  new Error(`Unsupported MySQL type "${column.columnType}" for column ${column.name}`);

/** Parses MySQL enum values (`'a','it''s'`). Returns undefined when the list is malformed. */
const enumValues = (args: string): string[] | undefined => {
  const values: string[] = [...args.matchAll(/'((?:[^']|'')*)'/g)].map((m: RegExpMatchArray) => m[1]);
  const rebuilt: string = values.map((value: string) => `'${value}'`).join(',');

  return values.length && rebuilt === args ? values.map((value: string) => value.replace(/''/g, "'")) : undefined;
};

/** Returns the Drizzle builder name and its call for one MySQL column. */
export const columnBuilder = (column: DbColumn): { builder: string; call: string } => {
  const match: RegExpMatchArray | null = column.columnType.match(/^([a-z]+)(?:\((.*)\))?( unsigned)?( zerofill)?$/);
  if (!match) {
    throw unsupported(column);
  }
  const [, base, args = '', unsignedFlag] = match;
  const name: string = JSON.stringify(column.name);
  const unsigned: boolean = Boolean(unsignedFlag);
  const digits: boolean = /^\d+$/.test(args);

  if (base === 'enum') {
    const values: string[] | undefined = enumValues(args);
    if (!values) {
      throw unsupported(column);
    }
    return { builder: 'mysqlEnum', call: `mysqlEnum(${name}, ${JSON.stringify(values)})` };
  }
  if (args && !digits && base !== 'decimal') {
    throw unsupported(column);
  }
  if (base === 'tinyint' && args === '1') {
    return { builder: 'boolean', call: `boolean(${name})` };
  }
  if (base === 'decimal') {
    const size: RegExpMatchArray | null = args.match(/^(\d+)(?:,(\d+))?$/);
    if (!size) {
      throw unsupported(column);
    }
    return { builder: 'decimal', call: `decimal(${name}, { precision: ${size[1]}, scale: ${size[2] ?? 0} })` };
  }
  if (SIZED.includes(base) && digits) {
    return { builder: base, call: `${base}(${name}, { length: ${args} })` };
  }
  if (base === 'bigint') {
    return { builder: base, call: `bigint(${name}, { mode: 'number'${unsigned ? ', unsigned: true' : ''} })` };
  }
  if (['tinyint', 'smallint', 'mediumint', 'int'].includes(base)) {
    return { builder: base, call: `${base}(${name}${unsigned ? ', { unsigned: true }' : ''})` };
  }
  if (PLAIN.includes(base)) {
    return { builder: base, call: `${base}(${name})` };
  }
  throw unsupported(column);
};

const SAFE_NAME: RegExp = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Names become JS identifiers, URL paths and file names in the generated code. */
const assertSafeNames = (tables: DbTable[]): void => {
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

const primaryColumns = (table: DbTable): DbColumn[] => table.columns.filter((column: DbColumn) => column.primary);

/** Tables with one primary key column get CRUD routes. Link tables do not. */
export const routedTables = (tables: DbTable[]): DbTable[] =>
  tables.filter((table: DbTable) => primaryColumns(table).length === 1);

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
  const id: string = NUMERIC.includes(primary.columnType.split(/[ (]/)[0]) ? 'Number(req.params.id)' : 'req.params.id';

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
    .map((table: DbTable) => `app.use('/${table.name.replace(/_/g, '-')}', ${camel(table.name)});`)
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
  };
  for (const table of routedTables(tables)) {
    files[`src/routes/${camel(table.name)}.js`] = routeFile(table);
  }

  return files;
};
