import * as assert from 'assert';
import * as mysql from 'mysql';
import MysqlHandler from '../../../src/handlers/MysqlHandler';
import config from '../../../src/configs/config';
import { Schema, Table, TableReference } from '../../../src/commons/types';

const validConnectionData: mysql.IConnectionConfig = config.CONNECTION_INFO.MYSQL[config.ENV];

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
          assert.equal(tableNames.length, 5);
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

          assert.equal(table.name, 'users');
          assert.equal(Object.keys(table.columns).length, 4);

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
            assert.equal(relation.table, 'users');
            assert.equal(relation.column, 'id');
            assert.equal(relation.name, 'user_id');
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
          assert.equal(schema.length, 4);

          const users: Table = schema.filter((table: Table) => table.name === 'users')[0];
          const accounts: Table = schema.filter((table: Table) => table.name === 'accounts')[0];

          assert.equal(users.name, 'users');
          assert.equal(Object.keys(users.columns).length, 7);
          assert.equal(accounts.name, 'accounts');
          assert.equal(Object.keys(accounts.columns).length, 4);

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
