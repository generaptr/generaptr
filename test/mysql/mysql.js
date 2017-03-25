const assert = require('assert');
const cli = require('../../lib/cli.js');

describe('print', () => {
  it('should throw an error without a database provided', () => {
    try {
      cli.handleMysqlConnection({
        host: '127.0.0.1',
        port: '3306',
      });
    } catch (e) {
      assert.equal('Database not provided.', e.message);
    }
  });

  it('should throw an error without a user provided', () => {
    try {
      cli.handleMysqlConnection({
        host: '127.0.0.1',
        port: '3306',
        database: 'test'
      });
    } catch (e) {
      assert.equal('User not provided.', e.message);
    }
  });

  it('should return a valid schema', () => {
    try {
      cli.handleMysqlConnection({
        host: '127.0.0.1',
        port: '3306',
        database: 'test',
        user: 'root',
        password: '',
      }).then((schema) => {
        assert.equal(1, schema.length);
        const table = schema.pop();
        console.log(table);
        assert.equal('test', table.name);
        assert.equal(4, table.columns.length);
      });
    } catch (e) {
      assert.fail();
    }
  });
  
});