const assert = require('assert');
const mysqlConnectionValidator = require('../../src/validators/MysqlConnectionValidator');

describe('Mysql connection validator', () => {
  it('should throw an error without a host provided', () => {
    try {
      mysqlConnectionValidator.isValid({});
    } catch (e) {
      assert.equal(e.message, 'Host not provided.');
    }
  });

  it('should throw an error without a valid port provided', () => {
    try {
      mysqlConnectionValidator.isValid({
        host: '127.0.0.1',
        port: null,
      });
    } catch (e) {
      assert.equal(e.message, 'Valid port not provided.');
    }
  });

  it('should throw an error without a database provided', () => {
    try {
      mysqlConnectionValidator.isValid({
        host: '127.0.0.1',
        port: 3306,
      });
    } catch (e) {
      assert.equal(e.message, 'Database not provided.');
    }
  });

  it('should throw an error without a user provided', () => {
    try {
      mysqlConnectionValidator.isValid({
        host: '127.0.0.1',
        port: 3306,
        database: 'test',
      });
    } catch (e) {
      assert.equal(e.message, 'User not provided.');
    }
  });

  it('should not throw any errors with valid data', () => {
    try {
      assert.equal(true, mysqlConnectionValidator.isValid({
        host: '127.0.0.1',
        port: 3306,
        database: 'test',
        user: 'root',
        password: '',
      }));
    } catch (e) {
      assert.fail();
    }
  });
});
