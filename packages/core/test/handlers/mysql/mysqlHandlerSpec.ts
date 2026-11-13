import assert from 'node:assert';
import * as mysql from 'mysql2';
import MysqlHandler from '../../../src/handlers/mysqlHandler';
import config from '../../../src/configs/config';
import { Schema, Table, TableReference } from '../../../src/commons/types';

const validConnectionData: mysql.ConnectionOptions = config.CONNECTION_INFO.MYSQL[config.ENV];

describe('Suite for testing MySqlHandler class', () => {
  let handler: MysqlHandler;

  beforeEach(async () => {
    handler = new MysqlHandler(validConnectionData);
    await handler.connect();
  });

  afterEach(async () => {
    await handler.close();
  });

  it('should return an array with the table names', async () => {
    const tableNames: string[] = await handler.getTables();
    assert.strictEqual(tableNames.length, 5);
  });

  it('should return a valid table schema', async () => {
    const table: Table = await handler.getTableSchema('users');

    assert.strictEqual(table.name, 'users');
    assert.strictEqual(Object.keys(table.columns).length, 4);
  });

  it('should detect a table relation', async () => {
    const relations: TableReference[] = await handler.getRelationsForTable('accounts');
    const relation: TableReference | undefined = relations.pop();
    if (relation) {
      assert.strictEqual(relation.table, 'users');
      assert.strictEqual(relation.column, 'id');
      assert.strictEqual(relation.name, 'user_id');
    }
  });

  it('should return a valid database schema', async () => {
    const schema: Schema = await handler.readSchema();
    assert.strictEqual(schema.length, 4);

    const users: Table = schema.filter((table: Table) => table.name === 'users')[0];
    const accounts: Table = schema.filter((table: Table) => table.name === 'accounts')[0];

    assert.strictEqual(users.name, 'users');
    assert.strictEqual(Object.keys(users.columns).length, 7);
    assert.strictEqual(accounts.name, 'accounts');
    assert.strictEqual(Object.keys(accounts.columns).length, 4);
  });
});
