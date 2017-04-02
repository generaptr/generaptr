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
        host: '172.16.140.134',
        port: '3306',
        database: 'test',
        user: 'root',
        password: 'secret',
      }).then((schema) => {
        assert.equal(1, schema.length);
        const table = schema.pop();
        assert.equal('users', table.name);
        assert.equal(4, Object.keys(table.columns).length);
        done();
      }).catch(err => {console.log(err); assert.fail(), done()});
    } catch (e) {
      assert.fail();
      done();
    }
  });
  
});