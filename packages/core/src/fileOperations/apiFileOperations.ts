import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { styleText } from 'node:util';
import { parse } from 'yaml';
import { run } from '../commons/utils/run.js';
import { renderApi } from '../generators/api/express.js';
import { openApiDocument, tablesFromOpenApi } from '../generators/spec/openapi.js';
import { DbSchema, Dialect, PackageJsonInfo } from '../commons/types.js';

/**
 * Writes an Express 5 + Drizzle API for the given tables into `dir`.
 */
export const generateApi = async (dir: string, info: PackageJsonInfo, schema: DbSchema): Promise<string[]> => {
  const files: Record<string, string> = renderApi(schema, info);
  for (const [file, content] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(dir, file)), { recursive: true });
    await fs.writeFile(path.join(dir, file), content, 'utf-8');
  }

  return Object.keys(files);
};

/**
 * Installs the generated API's pinned dependencies.
 */
export const installApi = async (dir: string): Promise<void> => {
  console.log(`running: ${styleText('green', 'npm install')}`);
  await run('npm', ['install', '--no-audit', '--no-fund'], dir);
};

/**
 * Writes `openapi.json` for the given tables into `dir`.
 */
export const generateSpec = async (dir: string, info: PackageJsonInfo, schema: DbSchema): Promise<string> => {
  const file: string = path.join(dir, 'openapi.json');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(openApiDocument(schema, info), undefined, 2)}\n`, 'utf-8');

  return file;
};

/**
 * Reads tables from an OpenAPI 3.1 document in YAML or JSON, with column types for `dialect`.
 * YAML is a superset of JSON, so one parser reads both.
 */
export const readOpenApi = async (file: string, dialect: Dialect): Promise<DbSchema> =>
  tablesFromOpenApi(parse(await fs.readFile(file, 'utf-8')), dialect);
