const mysql = require('mysql');
const RamlDataTypeConvertor = require('../commons/utils/ramlDataTypeConvertor');

class MysqlHandler {
  constructor(options) {
    this.options = options;
    this.connection = mysql.createConnection({
      host: this.options.host,
      port: this.options.port,
      user: this.options.user,
      password: this.options.password,
      database: 'information_schema',
    });
  }

  connect() {
    return this.connection.connect();
  }

  readTables() {
    return new Promise((resolve, reject) => {
      this.connection.query(
        `SELECT TABLE_NAME FROM TABLES WHERE TABLE_SCHEMA = '${this.options.database}';`,
        (err, results) => {
          if (err) {
            return reject(err);
          }
          const tables = results.map((result) => {
            return result['TABLE_NAME'];
          });

          resolve(tables);
        }
      );
    });
  }

  readSchema(tables) {
    const promises = [];
    for (const key in tables) {
      promises.push(
        new Promise((resolve, reject) => {
          this.connection.query(
            `SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM COLUMNS WHERE TABLE_SCHEMA = '${this.options.database}' AND TABLE_NAME = '${tables[key]}';`,
            (err, results) => {
              if (err) {
                return reject(err);
              }
              const table = {
                name: tables[key],
                columns: {},
              };

              results.forEach((result) => {
                table.columns[result['COLUMN_NAME']] = {
                  nullable: result['IS_NULLABLE'],
                  type: RamlDataTypeConvertor.convertType('MySql', result['DATA_TYPE']),
                  length: result['CHARACTER_MAXIMUM_LENGTH'],
                };
              });

              resolve(table);
            }
          );
        })
      );
    }
    return Promise.all(promises);
  }

  close() {
    this.connection.end();
  }
}

module.exports = MysqlHandler;
