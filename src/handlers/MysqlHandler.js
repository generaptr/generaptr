const mysql = require('mysql');

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
        this.getTableSchema(tables[key])
      );
    }
    return Promise.all(promises);
  }

  getTableSchema(tableName) {
    return new Promise((resolve, reject) => {
      const table = {
        name: tableName,
        columns: {},
      };

      this.connection.query(
        `SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM COLUMNS WHERE TABLE_SCHEMA = '${this.options.database}' AND TABLE_NAME = '${tableName}';`,
        (err, columns) => {
          if (err) {
            return reject(err);
          }
          this.getRelationsForTable(tableName).then(relation => {
            columns.forEach((result) => {
              const column = {
                nullable: result['IS_NULLABLE'],
                type: result['DATA_TYPE'],
                length: result['CHARACTER_MAXIMUM_LENGTH'],
              };
              if (relation[result['COLUMN_NAME']]) {
                column['references'] = relation[result['COLUMN_NAME']];
              }
              table.columns[result['COLUMN_NAME']] = column;
            });

            resolve(table);
          });
        }
      );
    });
  }

  getRelationsForTable(table) {
    return new Promise((resolve, reject) => {
      const references = {};
      this.connection.query(
        `SELECT FOR_NAME, FOR_COL_NAME, REF_NAME, REF_COL_NAME FROM INNODB_SYS_FOREIGN f JOIN INNODB_SYS_FOREIGN_COLS c ON c.ID = f.ID WHERE f.FOR_NAME LIKE '${this.options.database}/${table}'`,
        (err, relations) => {
          if (err) {
            return reject(err);
          }
          relations.forEach(relation => {
            references[relation['FOR_COL_NAME']] = {
              table: (relation['REF_NAME'].split('/')).pop(),
              column: (relation['REF_COL_NAME'].split('/')).pop(),
            }
          });

          resolve(references);
        }
      );
    });
  }

  /**
   * Closes the MySql connection.
   */
  close() {
    this.connection.end();
  }
}

module.exports = MysqlHandler;
