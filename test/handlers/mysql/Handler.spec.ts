import * as assert from 'assert';
import Handler from '../../../src/handlers/mysql/Handler';
import Parser from '../../../src/handlers/mysql/Parser';

describe('MySql Handler', async () => {
  const options = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'secret',
    database: 'test',
  };

  it('should initiate the right handler', () => {
    assert.equal(new Handler(options) instanceof Handler, true);
  });

  it('should use the proper parser', () => {
    assert.equal((new Handler(options)).getParser() instanceof Parser, true);
  });

  it('should fail to connect with bad data', async () => {
    try {
      const instance = new Handler({...options, password: 'not-the-right-password'});
      await instance.getSchema();
    } catch (error) {
      assert.equal(error.message.indexOf(`Access denied for user`) > -1, true);
    }
  });

  it('should properly return a valid schema', async () => {
    const instance = new Handler(options);
    const schema = await instance.getSchema();
    assert.equal(schema.getTables().length, 5);
  });
});