const assert = require('assert');
const mysql = require('../../../src/tracks/relational/mysql.js');

describe('print', () => {
  it('should throw an error without a database provided', () => {
    try {
      mysql.handler({
        host: '127.0.0.1',
        port: '3306',
      });
    } catch (e) {
      assert.equal('Database not provided.', e.message);
    }
  });

  it('should throw an error without a user provided', () => {
    try {
      mysql.handler({
        host: '127.0.0.1',
        port: '3306',
        database: 'test'
      });
    } catch (e) {
      assert.equal('User not provided.', e.message);
    }
  });

  it('should return a valid schema', (done) => {
    try {
      mysql.handler({
        host: '127.0.0.1',
        port: '3306',
        database: 'test',
        user: 'root',
        password: '',
      }).then((schema) => {
        console.log(schema);
        assert.equal(2, schema.length);
        const users = schema.filter(table => table.name  === 'users').pop();
        const accounts = schema.filter(table => table.name === 'accounts').pop();

        assert.equal('users', users.name);
        assert.equal(4, Object.keys(users.columns).length);
        assert.equal('accounts', accounts.name);
        assert.equal(3, Object.keys(accounts.columns).length);

        done();
      }).catch(err => {console.log(err); assert.fail(); done()});
    } catch (e) {
      assert.fail();
      done();
    }
  });

  it('should detect a foreign key', (done) => {
    try {
      mysql.handler({
        host: '127.0.0.1',
        port: '3306',
        database: 'test',
        user: 'root',
        password: '',
      }).then((schema) => {
        console.log(schema);
        const accounts = schema.filter(table => table.name === 'accounts').pop();

        assert.equal('users', accounts.columns['user_id'].references.table);
        assert.equal('id', accounts.columns['user_id'].references.column);

        done();
      }).catch(err => {console.log(err); assert.fail(); done()});
    } catch (e) {
      assert.fail();
      done();
    }
  })
});