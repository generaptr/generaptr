import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import mysql from 'mysql2/promise';
import pg from 'pg';
import { generateApi, installApi } from '../../src/fileOperations/apiFileOperations.js';
import type { DbSchema } from '../../src/commons/types.js';
import MysqlHandler from '../../src/handlers/mysqlHandler.js';
import PostgresHandler from '../../src/handlers/postgresHandler.js';
import config from '../config.js';

const SOURCE = 'gen_fidelity_source';
const COPY = 'gen_fidelity_copy';
const mysqlConnection = config.CONNECTION_INFO.MYSQL[config.ENV];
const postgresConnection = config.CONNECTION_INFO.POSTGRES;

// Every table object, with its name, as lines that sort the same in both databases.
const POSTGRES_CATALOG: string = `
  SELECT 'column ' || c.relname || '.' || a.attname || ' ' || format_type(a.atttypid, a.atttypmod)
    || CASE WHEN a.attnotnull THEN ' not null' ELSE '' END
    || CASE WHEN a.attgenerated <> '' THEN ' generated ' ELSE '' END
    || CASE WHEN a.attidentity <> '' THEN ' identity ' || a.attidentity::text ELSE '' END
    || coalesce(' default ' || pg_get_expr(d.adbin, d.adrelid), '') AS line
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND a.attnum > 0 AND NOT a.attisdropped
  UNION ALL
  SELECT 'constraint ' || c.relname || ' ' || k.conname || ' ' || pg_get_constraintdef(k.oid)
  FROM pg_constraint k JOIN pg_class c ON c.oid = k.conrelid JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  UNION ALL
  SELECT 'index ' || pg_get_indexdef(i.indexrelid)
  FROM pg_index i JOIN pg_class c ON c.oid = i.indrelid JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND NOT EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conindid = i.indexrelid)
  UNION ALL
  SELECT 'enum ' || t.typname || ' ' || string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder)
  FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' GROUP BY t.typname
  UNION ALL
  SELECT 'sequence ' || s.relname || ' ' || format_type(q.seqtypid, NULL) || ' ' || q.seqstart || ' ' || q.seqincrement
    || ' ' || q.seqmin || ' ' || q.seqmax || ' ' || q.seqcache || ' ' || q.seqcycle
  FROM pg_sequence q JOIN pg_class s ON s.oid = q.seqrelid JOIN pg_namespace n ON n.oid = s.relnamespace
  WHERE n.nspname = 'public'
  ORDER BY 1`;

const dialects = [
  {
    dialect: 'postgresql',
    recreate: async (name: string): Promise<void> => {
      const client = new pg.Client(postgresConnection);
      await client.connect();
      await client.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      await client.query(`CREATE DATABASE ${name}`);
      await client.end();
    },
    run: async (database: string, sql: string): Promise<void> => {
      const client = new pg.Client({ ...postgresConnection, database });
      await client.connect();
      await client.query(sql);
      await client.end();
    },
    catalog: async (database: string): Promise<string[]> => {
      const client = new pg.Client({ ...postgresConnection, database });
      await client.connect();
      const { rows } = await client.query<{ line: string }>(POSTGRES_CATALOG);
      await client.end();
      return rows.map((row: { line: string }) => row.line);
    },
    read: async (database: string): Promise<DbSchema> => {
      const handler = new PostgresHandler({ ...postgresConnection, database });
      try {
        return await handler.readSchema();
      } finally {
        await handler.close();
      }
    },
  },
  {
    dialect: 'mysql',
    recreate: async (name: string): Promise<void> => {
      const connection = await mysql.createConnection({ ...mysqlConnection, database: undefined });
      await connection.query(`DROP DATABASE IF EXISTS ${name}`);
      await connection.query(`CREATE DATABASE ${name}`);
      await connection.end();
    },
    run: async (database: string, sql: string): Promise<void> => {
      const connection = await mysql.createConnection({ ...mysqlConnection, database, multipleStatements: true });
      // MySQL reads `--` as a comment only when a space follows, so drizzle-kit's breakpoint markers go first.
      await connection.query(sql.replace(/^--> statement-breakpoint$/gm, ''));
      await connection.end();
    },
    // SHOW CREATE TABLE is MySQL's own full definition of a table.
    catalog: async (database: string): Promise<string[]> => {
      const connection = await mysql.createConnection({ ...mysqlConnection, database });
      const [tables] = await connection.query<mysql.RowDataPacket[]>('SHOW TABLES');
      const lines: string[] = [];
      for (const row of tables) {
        const [[created]] = await connection.query<mysql.RowDataPacket[]>(`SHOW CREATE TABLE \`${Object.values(row)[0]}\``);
        // drizzle-kit writes every default in parentheses, so CURRENT_TIMESTAMP comes back as the same default, (now()).
        lines.push(String(created['Create Table']).replace(/ AUTO_INCREMENT=\d+/, '')
          .replace(/DEFAULT CURRENT_TIMESTAMP(?:\((\d)\))?/g, (_: string, fsp?: string) => `DEFAULT (now(${fsp ?? ''}))`));
      }
      await connection.end();
      return lines.sort();
    },
    read: async (database: string): Promise<DbSchema> => {
      const handler = new MysqlHandler({ ...mysqlConnection, database });
      try {
        return await handler.readSchema();
      } finally {
        await handler.close();
      }
    },
  },
];

describe.each(dialects)('schema fidelity on $dialect', ({ dialect, recreate, run, catalog, read }) => {
  let dir: string;

  afterAll(async () => {
    if (dir) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('rebuilds the source schema from the generated Drizzle schema', async () => {
    await recreate(SOURCE);
    await run(SOURCE, await fs.readFile(path.join(import.meta.dirname, 'fidelity', `${dialect}.sql`), 'utf-8'));

    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'generaptr fidelity '));
    await generateApi(dir, { name: 'fidelity', version: '1.0.0', description: '', author: '', license: 'MIT' }, await read(SOURCE));
    await installApi(dir);
    const exported = spawnSync('npx', ['drizzle-kit', 'export'], { cwd: dir, encoding: 'utf-8' });
    assert.strictEqual(exported.status, 0, exported.stderr);

    await recreate(COPY);
    await run(COPY, exported.stdout);
    assert.deepStrictEqual(await catalog(COPY), await catalog(SOURCE));
  }, 300000);
});
