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

  it('should return a valid schema', (done) => {
    try {
      cli.handleMysqlConnection({
        host: '127.0.0.1',
        port: '3306',
        database: 'test',
        user: 'root',
        password: '',
      }).then((schemaInformation) => {
        assert(schemaInformation, 'Schema information should not be undefined');
        assert.equal('MySql', schemaInformation.databaseEngine, 'Database engine should be MySql');
        assert.equal(1, schemaInformation.schema.length);
        const table = schemaInformation.schema.pop();
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