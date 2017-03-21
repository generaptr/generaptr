(() => {
  const colors = require('colors');
  const pkg = require('../package.json');
  const MysqlHandler = require('../src/handlers/MysqlHandler');

  function log(message) {
    return console.log(`[ ${'generaptr'.white} ] ${message.toString().cyan}`);
  }

  function throwError(paramName) {
    throw new Error(`${paramName} not provided.`);
  }

  exports.handleMysqlConnection = (options) => {
    // ['host', 'port', 'database', 'user', 'password']
    if (!(options && options.host && typeof options.host === 'string')) {
      throwError('Host');
    }
    if (!(options && options.port && typeof options.port === 'string')) {
      throwError('Port');
    }
    if (!(options && options.database && typeof options.database === 'string')) {
      throwError('Database');
    }
    if (!(options && options.user && typeof options.user === 'string')) {
      throwError('User');
    }
    if (!(options && options.password && typeof options.password === 'string')) {
      throwError('Password');
    }

    const handler = new MysqlHandler(options);
    handler.connect();
    handler.readSchema();
  }
}).call(this);
