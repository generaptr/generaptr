(() => {
  const pkg = require('../package.json');

  const MysqlHandler = require('../src/handlers/MysqlHandler');

  exports.handleMysqlConnection = (options) => {

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
