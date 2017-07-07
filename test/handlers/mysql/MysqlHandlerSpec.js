const assert = require('assert');
const MysqlHandler = require('../../../src/handlers/MysqlHandler');
const config = require('../../../src/configs/config');

const validConnectionData = config.CONNECTION_INFO.MYSQL[config.ENV];

describe('Mysql database handler', () => {
  let handler = null;

  beforeEach(() => {
    handler = new MysqlHandler(validConnectionData);
    handler.connect();
  });

  afterEach(() => {
    handler.close();
    handler = null;
  });

  it('should create a valid handler', () => {
    try {
      const handler = new MysqlHandler(validConnectionData);
      assert.equal(handler.options, validConnectionData);
    } catch (e) {
      assert.fail();
    }
  });

  it('should connect to the database', () => {
    try {
      assert.notEqual(handler.connection, null);
    } catch (e) {
      assert.fail();
    }
  });

  it('should return an array with the table names', (done) => {
    try {
      handler.getTables().then(tables => {
        assert.equal(tables.length, 5);
        done();
      }).catch(err => {
        console.log(err);
        assert.fail();
        done();
      });
    } catch (e) {
      assert.fail(e);
      done();
    }
  });

  it('should return a valid table schema', (done) => {
    try {
      handler.getTableSchema('users').then(schema => {

        assert.equal(schema.name, 'users');
        assert.equal(Object.keys(schema.columns).length, 4);

        done();
      }).catch(err => {
        console.log(err);
        assert.fail();
        done();
      });

    } catch (e) {
      assert.fail();
      done();
    }
  });

  it('should detect a table relation', (done) => {
    try {
      handler.getRelationsForTable('accounts').then(relations => {
        const relation = relations.pop();
        assert.equal(relation.table, 'users');
        assert.equal(relation.column, 'id');
        assert.equal(relation.name, 'user_id');

        done();
      }).catch(err => {
        console.log(err);
        assert.fail();
        done();
      });
    } catch (e) {
      assert.fail();
      done();
    }
  });

  it('should return a valid database schema', (done) => {
    try {
      handler.readSchema().then(schema => {
        assert.equal(schema.length, 4);

        const users = schema.filter(table => table.name === 'users').pop();
        const accounts = schema.filter(table => table.name === 'accounts').pop();

        assert.equal(users.name, 'users');
        assert.equal(Object.keys(users.columns).length, 6);
        assert.equal(accounts.name, 'accounts');
        assert.equal(Object.keys(accounts.columns).length, 3);

        done();
      }).catch(err => {
        console.log(err);
        assert.fail();
        done();
      });
    } catch (e) {
      assert.fail();
      done();
    }
  });
});
