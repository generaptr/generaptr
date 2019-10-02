import * as assert from 'assert';
import * as mysql from 'mysql2';
import MysqlHandler from '../../../src/handlers/mysqlHandler';
import config from '../../../src/configs/config';
import { Schema, Table, TableReference } from '../../../src/commons/types';

const validConnectionData: mysql.ConnectionOptions = config.CONNECTION_INFO.MYSQL[config.ENV];

describe('Suite for testing MySqlHandler class', () => {
  let handler: MysqlHandler | undefined;

  beforeEach(() => {
    handler = new MysqlHandler(validConnectionData);
    handler.connect();
  });

  afterEach(() => {
    if (handler) {
      handler.close();
    }
    handler = undefined;
  });

  it('should return an array with the table names', (done: Function) => {
    try {
      if (handler) {
        handler.getTables().then((tableNames: string[]) => {
          assert.strictEqual(tableNames.length, 5);
          done();
        }).catch((err: Error) => {
          console.log(err);
          assert.fail(err.message);
          done();
        });
      }
    } catch (e) {
      assert.fail(e);
      done();
    }
  });

  it('should return a valid table schema', (done: Function) => {
    try {
      if (handler) {
        handler.getTableSchema('users').then((table: Table) => {

          assert.strictEqual(table.name, 'users');
          assert.strictEqual(Object.keys(table.columns).length, 4);

          done();
        }).catch((err: Error) => {
          console.log(err);
          assert.fail(err.message);
          done();
        });
      }
    } catch (e) {
      assert.fail(e.message);
      done();
    }
  });

  it('should detect a table relation', (done: Function) => {
    try {
      if (handler) {
        handler.getRelationsForTable('accounts').then((relations: TableReference[]) => {
          const relation: TableReference | undefined = relations.pop();
          if (relation) {
            assert.strictEqual(relation.table, 'users');
            assert.strictEqual(relation.column, 'id');
            assert.strictEqual(relation.name, 'user_id');
          }
          done();
        }).catch((err: Error) => {
          console.log(err);
          assert.fail(err.message);
          done();
        });
      }
    } catch (e) {
      assert.fail(e.message);
      done();
    }
  });

  it('should return a valid database schema', (done: Function) => {
    try {
      if (handler) {
        handler.readSchema().then((schema: Schema) => {
          assert.strictEqual(schema.length, 4);

          const users: Table = schema.filter((table: Table) => table.name === 'users')[0];
          const accounts: Table = schema.filter((table: Table) => table.name === 'accounts')[0];

          assert.strictEqual(users.name, 'users');
          assert.strictEqual(Object.keys(users.columns).length, 7);
          assert.strictEqual(accounts.name, 'accounts');
          assert.strictEqual(Object.keys(accounts.columns).length, 4);

          done();
        }).catch((err: Error) => {
          console.log(err);
          assert.fail(err.message);
          done();
        });
      }
    } catch (e) {
      assert.fail(e.message);
      done();
    }
  });
});
