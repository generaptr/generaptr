import assert from 'node:assert';
import { DbColumn, DbTable } from '../../../src/commons/types.js';
import PostgresHandler from '../../../src/handlers/postgresHandler.js';
import config from '../../config.js';

const connection = config.CONNECTION_INFO.POSTGRES;

const column = (name: string, columnType: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType, nullable: false, autoIncrement: false, ...extra,
});

describe('PostgresHandler', () => {
  it('reads tables with real names, exact types, keys, and enums', async () => {
    const handler = new PostgresHandler(connection);
    await handler.connect();
    const schema = await handler.readSchema();
    await handler.close();

    assert.strictEqual(schema.dialect, 'postgresql');
    assert.deepStrictEqual(schema.tables.map((table: DbTable) => table.name), ['accounts', 'applications', 'groups', 'users', 'users_groups']);
    const table = (name: string): DbColumn[] => schema.tables.find((t: DbTable) => t.name === name)?.columns ?? [];
    const keys = (name: string): Partial<DbTable> => {
      const { name: _name, columns: _columns, ...rest } = schema.tables.find((t: DbTable) => t.name === name) as DbTable;
      return rest;
    };

    assert.deepStrictEqual(table('users'), [
      column('id', 'integer', { autoIncrement: true }),
      column('firstName', 'character varying(255)', { nullable: true }),
      column('lastName', 'character varying(255)', { nullable: true }),
      column('email', 'character varying(50)'),
      column('active', 'boolean', { default: 'true' }),
      column('balance', 'numeric(10,2)', { nullable: true }),
      column('created_at', 'timestamp with time zone', { default: 'now()' }),
      column('settings', 'jsonb', { nullable: true }),
      column('external_id', 'uuid', { nullable: true }),
    ]);
    assert.deepStrictEqual(table('accounts'), [
      column('id', 'integer', { autoIncrement: true }),
      column('type', "enum('admin','member','it''s')", { enumName: 'account_type' }),
      column('user_id', 'integer'),
    ]);
    assert.deepStrictEqual(keys('accounts'), {
      primaryKey: { name: 'accounts_pkey', columns: ['id'] },
      uniques: [{ name: 'accounts_user_id_key', columns: ['user_id'] }],
      foreignKeys: [{ name: 'accounts_user_id_fkey', columns: ['user_id'], table: 'users', foreignColumns: ['id'] }],
    });
    assert.deepStrictEqual(table('applications')[0], column('id', 'bigint', { autoIncrement: true }));
    assert.deepStrictEqual(table('groups').slice(2), [
      column('tags', 'text[]', { nullable: true }),
      column('seen_at', 'timestamp(3) with time zone', { nullable: true }),
    ]);
    assert.deepStrictEqual(table('users_groups'), [
      column('user_id', 'integer'),
      column('group_id', 'integer'),
    ]);
    assert.deepStrictEqual(keys('users_groups'), {
      primaryKey: { name: 'users_groups_pkey', columns: ['user_id', 'group_id'] },
      foreignKeys: [
        { name: 'users_groups_group_id_fkey', columns: ['group_id'], table: 'groups', foreignColumns: ['id'] },
        { name: 'users_groups_user_id_fkey', columns: ['user_id'], table: 'users', foreignColumns: ['id'] },
      ],
    });
  });

  it('rejects a wrong password when it connects', async () => {
    const handler = new PostgresHandler({ ...connection, password: 'wrong' });
    await assert.rejects(handler.connect(), /password authentication failed/);
    await handler.close();
  });
});
