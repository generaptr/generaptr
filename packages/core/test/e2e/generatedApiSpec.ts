import assert from 'node:assert';
import { type ChildProcess, spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import config from '../config.js';
import { generateApi, installApi } from '../../src/fileOperations/apiFileOperations.js';
import MysqlHandler from '../../src/handlers/mysqlHandler.js';
import PostgresHandler from '../../src/handlers/postgresHandler.js';
import { DbSchema } from '../../src/commons/types.js';

const mysqlConnection = config.CONNECTION_INFO.MYSQL[config.ENV];
const postgresConnection = config.CONNECTION_INFO.POSTGRES;

const dialects = [
  {
    dialect: 'mysql',
    port: 3919,
    read: async (): Promise<DbSchema> => {
      const handler = new MysqlHandler(mysqlConnection);
      const schema = await handler.readSchema();
      await handler.close();
      return schema;
    },
    url: `mysql://${mysqlConnection.user}:${mysqlConnection.password}@${mysqlConnection.host}:${mysqlConnection.port}/${mysqlConnection.database}`,
  },
  {
    dialect: 'postgresql',
    port: 3921,
    read: async (): Promise<DbSchema> => {
      const handler = new PostgresHandler(postgresConnection);
      const schema = await handler.readSchema();
      await handler.close();
      return schema;
    },
    url: `postgres://${postgresConnection.user}:${postgresConnection.password}@${postgresConnection.host}:${postgresConnection.port}/${postgresConnection.database}`,
  },
];

let base: string;

const send = async (method: string, url: string, body?: object): Promise<Response> =>
  fetch(`${base}${url}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

// The API's own contract, so the test reads the body as that shape.
const json = async <T>(response: Response): Promise<T> => (await response.json()) as T;

describe.each(dialects)('generated Express + Drizzle API on $dialect', ({ dialect, port, read, url }) => {
  let dir: string;
  let server: ChildProcess;

  beforeAll(async () => {
    base = `http://127.0.0.1:${port}`;
    const schema = await read();

    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'generaptr api '));
    await generateApi(dir, { name: 'demo-api', version: '1.0.0', description: '', author: '', license: 'MIT' }, schema);
    await installApi(dir);

    server = spawn('node', ['src/index.js'], {
      cwd: dir,
      env: {
        ...process.env,
        PORT: String(port),
        DATABASE_URL: url,
      },
    });
    await new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
      server.stdout?.on('data', (chunk: Buffer) => chunk.toString().includes('Listening') && resolve());
      server.on('exit', (code: number | null) => reject(new Error(`API exited with code ${code}`)));
    });
  }, 300000);

  afterAll(async () => {
    server?.kill();
    if (dir) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('runs CRUD on a table and on a table with a foreign key', async () => {
    const email = `ada-${Date.now()}@example.com`;
    const created = await send('POST', '/users', { firstName: 'Ada', email });
    assert.strictEqual(created.status, 201);
    const { id: userId } = await json<{ id: number }>(created);
    assert.strictEqual(created.headers.get('location'), `/users/${userId}`);

    assert.strictEqual((await send('PUT', `/users/${userId}`, { lastName: 'Lovelace' })).status, 204);
    const user = await json<Record<string, unknown>>(await send('GET', `/users/${userId}`));
    assert.deepStrictEqual(
      { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
      { id: userId, firstName: 'Ada', lastName: 'Lovelace', email },
    );

    const account = await send('POST', '/accounts', { type: 'admin', userId });
    assert.strictEqual(account.status, 201);
    const { id: accountId } = await json<{ id: number }>(account);
    const accounts = await json<{ id: number; userId: number }[]>(await send('GET', '/accounts?limit=100'));
    assert.ok(accounts.some((row: { id: number; userId: number }) => row.id === accountId && row.userId === userId));

    assert.strictEqual((await send('DELETE', `/accounts/${accountId}`)).status, 204);
    assert.strictEqual((await send('DELETE', `/users/${userId}`)).status, 204);
    assert.strictEqual((await send('GET', `/users/${userId}`)).status, 404);
  });

  it('includes related rows with ?with and rejects unknown relations', async () => {
    const email = `rel-${Date.now()}@example.com`;
    const { id: userId } = await json<{ id: number }>(await send('POST', '/users', { firstName: 'Rel', email }));
    const { id: accountId } = await json<{ id: number }>(await send('POST', '/accounts', { type: 'admin', userId }));

    const user = await json<{ accounts: { id: number }[]; groups: unknown[] }>(
      await send('GET', `/users/${userId}?with=accounts,groups`),
    );
    assert.deepStrictEqual(user.accounts.map((account: { id: number }) => account.id), [accountId]);
    assert.deepStrictEqual(user.groups, []);

    const accounts = await json<{ id: number; user: { email: string } }[]>(await send('GET', '/accounts?with=user&limit=100'));
    assert.strictEqual(accounts.find((account: { id: number }) => account.id === accountId)?.user.email, email);

    const unknown = await send('GET', `/users/${userId}?with=nope`);
    assert.strictEqual(unknown.status, 400);
    assert.deepStrictEqual(await json<object>(unknown), { message: 'Unknown relation "nope". Use: accounts, applications, groups' });

    assert.strictEqual((await send('DELETE', `/accounts/${accountId}`)).status, 204);
    assert.strictEqual((await send('DELETE', `/users/${userId}`)).status, 204);
  });

  it.runIf(dialect === 'postgresql')('round-trips arrays and timestamps through JSON', async () => {
    const seenAt = '2026-11-13T10:00:00.123Z';
    const created = await send('POST', '/groups', { name: 'ops', tags: ['a', "it's"], seenAt });
    assert.strictEqual(created.status, 201, await created.clone().text());
    const { id } = await json<{ id: number }>(created);
    const group = await json<Record<string, unknown>>(await send('GET', `/groups/${id}`));
    assert.deepStrictEqual(group.tags, ['a', "it's"]);
    assert.strictEqual(new Date(String(group.seenAt)).toISOString(), seenAt);
    assert.strictEqual((await send('DELETE', `/groups/${id}`)).status, 204);
  });

  it('hides database errors behind a generic 500', async () => {
    const response = await send('POST', '/accounts', { type: 'admin', userId: 999999999 });
    assert.strictEqual(response.status, 500);
    assert.deepStrictEqual(await json<object>(response), { message: 'Internal Server Error' });
  });

  it('rejects an invalid body with 400 before it reaches the database', async () => {
    const response = await send('POST', '/users', { email: 42 });
    assert.strictEqual(response.status, 400);
    assert.ok((await json<{ issues: object[] }>(response)).issues.length);
  });
});
