import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { stringify } from 'yaml';
import { readOpenApi } from '../../src/fileOperations/apiFileOperations.js';
import type { DbSchema } from '../../src/commons/types.js';
import { openApiDocument } from '../../src/generators/spec/openapi.js';

const schema: DbSchema = {
  dialect: 'postgresql',
  tables: [{
    name: 'users',
    columns: [
      { name: 'id', columnType: 'integer', nullable: false, primary: true, unique: false, autoIncrement: true },
      { name: 'email', columnType: 'character varying(50)', nullable: false, primary: false, unique: true, autoIncrement: false },
    ],
  }],
};

describe('readOpenApi', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'generaptr-openapi-'));
  });
  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it.each([
    ['openapi.yaml', stringify],
    ['openapi.yml', stringify],
    ['openapi.json', (doc: object) => JSON.stringify(doc, undefined, 2)],
  ])('reads %s back to the same tables', async (file: string, write: (doc: object) => string) => {
    await fs.writeFile(path.join(dir, file), write(openApiDocument(schema, { name: 'x', version: '1.0.0', description: '' })));
    assert.deepStrictEqual(await readOpenApi(path.join(dir, file), 'postgresql'), schema);
  });
});
