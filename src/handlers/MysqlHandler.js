const mysql = require('mysql');
const RamlDataTypeConvertor = require('../commons/utils/ramlDataTypeConvertor');
const Utils = require('../commons/utils/utils');

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
   * Reads the schema for each table provided.
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

  /**
   * Reads the schema for a given table.
   *
   * @param tableName
   * @returns {Promise}
   */
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
                type: RamlDataTypeConvertor.convertType('MySql', result['DATA_TYPE']),
                length: result['CHARACTER_MAXIMUM_LENGTH'],
              };
              if (relation[result['COLUMN_NAME']]) {
                column['references'] = relation[result['COLUMN_NAME']];

                // change type reference
                column.type = Utils.toTitleCase(column['references'].table);

                // change column name
                result['COLUMN_NAME'] = Utils.singular(column['references'].table);
              }
              table.columns[result['COLUMN_NAME']] = column;
            });

            resolve(table);
          });
        }
      );
    });
  }

  /**
   * Reads all the relations for a given table.
   *
   * @param table
   * @returns {Promise}
   */
  getRelationsForTable(table) {
    return new Promise((resolve, reject) => {
      const references = {};
      this.connection.query(
        `SELECT COLUMN_NAME, rc.REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM REFERENTIAL_CONSTRAINTS rc JOIN KEY_COLUMN_USAGE cu ON cu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME WHERE rc.CONSTRAINT_SCHEMA = '${this.options.database}' AND rc.TABLE_NAME = '${table}'`,
        (err, relations) => {
          if (err) {
            return reject(err);
          }
          relations.forEach(relation => {
            references[relation['COLUMN_NAME']] = {
              table: relation['REFERENCED_TABLE_NAME'],
              column: relation['REFERENCED_COLUMN_NAME'],
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
