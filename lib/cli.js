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
    options.host = options && options.host && typeof options.host === 'string' ? options.host : '127.0.0.1';

    options.port = options && options.port && typeof options.port === 'string' ? options.port : '3306';

    options.password = options && options.password && typeof options.password === 'string' ? options.password : '';

    if (!(options && options.database && typeof options.database === 'string')) {
      throwError('Database');
    }

    if (!(options && options.user && typeof options.user === 'string')) {
      throwError('User');
    }


    const handler = new MysqlHandler(options);
    
    return new Promise((resolve, reject) => {

      handler.connect();
      handler.readTables().then((tables) => {
        handler.readSchema(tables).then((schema) => {

          handler.close();
          
          resolve(schema);
        });
      });
    });

  }
}).call(this);
