import assert from 'node:assert';
import type * as mysql from 'mysql2/promise';
import MysqlHandler from '../../../src/handlers/mysqlHandler';
import config from '../../config';

const connection: mysql.ConnectionOptions = config.CONNECTION_INFO.MYSQL[config.ENV];

describe('MysqlHandler', () => {
  it('reads tables with real names, exact types, and foreign keys', async () => {
    const handler = new MysqlHandler(connection);
    await handler.connect();
    const tables = await handler.readTables();
    await handler.close();

    assert.deepStrictEqual(tables.map((table) => table.name), ['accounts', 'applications', 'groups', 'users', 'users_groups']);
    const applications = tables.find((table) => table.name === 'applications');
    assert.deepStrictEqual(applications?.columns[0], {
      name: 'id', columnType: 'int unsigned', nullable: false, primary: true, unique: false, autoIncrement: true, references: undefined,
    });
    assert.deepStrictEqual(
      applications?.columns.filter((column) => column.references).map((column) => [column.name, column.references]),
      [['account_id', { table: 'accounts', column: 'id' }], ['owner_id', { table: 'users', column: 'id' }]],
    );
  });

  it('rejects a wrong password when it connects', async () => {
    const handler = new MysqlHandler({ ...connection, password: 'wrong' });
    await assert.rejects(handler.connect(), /Access denied/);
    await handler.close();
  });
});
