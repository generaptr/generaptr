const mysql = require('mysql');
const RamlDataTypeConvertor = require('../commons/utils/ramlDataTypeConvertor');

class MysqlHandler {
  /**
   * Constructor for the MySqlHandler.
   *
   * @param options Connection parameters.
   */
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

  /**
   * Connect to MySql based on the connection data.
   */
  connect() {
    this.connection.connect();
  }

  /**
   * Reads the information schema and returns an array of tables.
   *
   * @returns {Promise}
   */
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

  /**
   * Reads the schema for each table privided.
   *
   * @param tables
   * @returns {Promise.<*>}
   */
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

  /**
   * Closes the MySql connection.
   */
  close() {
    this.connection.end();
  }
}

module.exports = MysqlHandler;
