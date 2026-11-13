import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { generateWeb, installApi } from '../../src/fileOperations/apiFileOperations.js';
import PostgresHandler from '../../src/handlers/postgresHandler.js';
import config from '../config.js';

describe('generated web app', () => {
  let dir: string;

  afterAll(async () => {
    if (dir) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('installs and builds', async () => {
    const handler = new PostgresHandler(config.CONNECTION_INFO.POSTGRES);
    const schema = await handler.readSchema();
    await handler.close();

    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'generaptr web '));
    await generateWeb(dir, { name: 'demo-api', version: '1.0.0', description: '', author: '', license: 'MIT' }, schema);
    await installApi(dir);
    const built = spawnSync('npx', ['vite', 'build'], { cwd: dir, encoding: 'utf-8' });
    assert.strictEqual(built.status, 0, built.stderr);
    assert.match(await fs.readFile(path.join(dir, 'dist/index.html'), 'utf-8'), /<title>demo-api<\/title>/);
  }, 300000);
});
