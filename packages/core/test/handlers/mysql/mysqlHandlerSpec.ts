import assert from 'node:assert';
import type * as mysql from 'mysql2/promise';
import MysqlHandler from '../../../src/handlers/mysqlHandler.js';
import config from '../../config.js';

const connection: mysql.ConnectionOptions = config.CONNECTION_INFO.MYSQL[config.ENV];

describe('MysqlHandler', () => {
  it('reads tables with real names, exact types, and foreign keys', async () => {
    const handler = new MysqlHandler(connection);
    await handler.connect();
    const { dialect, tables } = await handler.readSchema();
    await handler.close();

    assert.strictEqual(dialect, 'mysql');
    assert.deepStrictEqual(tables.map((table) => table.name), ['accounts', 'applications', 'groups', 'users', 'users_groups']);
    const applications = tables.find((table) => table.name === 'applications');
    assert.deepStrictEqual(applications?.columns[0], { name: 'id', columnType: 'int unsigned', nullable: false, autoIncrement: true });
    assert.deepStrictEqual(applications?.primaryKey, { name: 'PRIMARY', columns: ['id'] });
    assert.deepStrictEqual(applications?.foreignKeys, [
      { name: 'applications_ibfk_1', columns: ['account_id'], table: 'accounts', foreignColumns: ['id'], onDelete: 'cascade' },
      { name: 'applications_ibfk_2', columns: ['owner_id'], table: 'users', foreignColumns: ['id'] },
    ]);
    assert.deepStrictEqual(tables.find((table) => table.name === 'accounts')?.uniques, [{ name: 'unique_user_id', columns: ['user_id'] }]);
  });

  it('rejects a wrong password when it connects', async () => {
    const handler = new MysqlHandler({ ...connection, password: 'wrong' });
    await assert.rejects(handler.connect(), /Access denied/);
    await handler.close();
  });

  it('reads column defaults as SQL expressions', async () => {
    const handler = new MysqlHandler(connection);
    const { tables } = await handler.readSchema();
    await handler.close();
    const users = tables.find((table) => table.name === 'users');
    assert.strictEqual(users?.columns.find((column) => column.name === 'email')?.default, "''");
    assert.strictEqual(users?.columns.find((column) => column.name === 'id')?.default, undefined);
  });
});
