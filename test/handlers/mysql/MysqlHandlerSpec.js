const assert = require('assert');
const MysqlHandler = require('../../../src/handlers/MysqlHandler');

const validConnectionData = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'test'
};

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
      assert.equal(validConnectionData, handler.options);
    } catch (e) {
      assert.fail();
    }
  });

  it('should connect to the database', () => {
    try {
      assert.notEqual(null, handler.connection);
    } catch (e) {
      assert.fail();
    }
  });

  it('should return an array with the table names', (done) => {
    try {
      handler.readTables().then(tables => {
        assert.equal(2, tables.length);
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

        assert.equal('users', schema.name);
        assert.equal(4, Object.keys(schema.columns).length);

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
        assert.equal('users', relations['user_id'].table);
        assert.equal('id', relations['user_id'].column);

        done();
      });
    } catch (e) {
      assert.fail();
      done();
    }
  });

  it('should return a valid database schema', (done) => {
    try {
      handler.readTables().then(tables => {
        handler.readSchema(tables).then(schema => {
          assert.equal(2, schema.length);

          const users = schema.filter(table => table.name  === 'users').pop();
          const accounts = schema.filter(table => table.name === 'accounts').pop();

          assert.equal('users', users.name);
          assert.equal(4, Object.keys(users.columns).length);
          assert.equal('accounts', accounts.name);
          assert.equal(3, Object.keys(accounts.columns).length);

          done();
        });
      });
    } catch (e) {
      assert.fail();
      done();
    }
  });
});