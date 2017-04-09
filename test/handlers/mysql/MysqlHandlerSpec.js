const assert = require('assert');
const MysqlHandler = require('../../../src/handlers/MysqlHandler');

const validConnectionData = {
  host: '192.168.99.100',
  port: 3306,
  user: 'root',
  password: 'secret',
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
      handler.getTables().then(tables => {
        assert.equal(5, tables.length);
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

        assert.equal('users', schema.name);
        assert.equal(4, Object.keys(schema.columns).length);

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
        assert.equal('users', relation.table);
        assert.equal('id', relation.column);
        assert.equal('user_id', relation.name);

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
        assert.equal(4, schema.length);

        const users = schema.filter(table => table.name === 'users').pop();
        const accounts = schema.filter(table => table.name === 'accounts').pop();

        assert.equal('users', users.name);
        assert.equal(6, Object.keys(users.columns).length);
        assert.equal('accounts', accounts.name);
        assert.equal(3, Object.keys(accounts.columns).length);

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
