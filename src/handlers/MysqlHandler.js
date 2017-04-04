const mysql = require('mysql');
const Utils = require('../commons/utils/utils');
const BaseHandler = require('./BaseHandler');

class MysqlHandler extends BaseHandler {
  /**
   * Constructor for the MySqlHandler.
   *
   * @param options Connection parameters.
   */
  constructor(options) {
    super('mysql');

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

  readSchema() {
    return new Promise((resolve, reject) => {
      this.getTables().then(tables => {
        const schemas = [];
        tables.forEach(table => {
          schemas.push(this.getTableSchema(table));
        });

        Promise.all(schemas).then(schema => {
          this.normalizeRelations(schema).then(result => {
            resolve(result);
          }).catch(err => reject(err));
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }
  /**
   * Reads the information schema and returns an array of tables.
   *
   * @returns {Promise}
   */
  getTables() {
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
        `SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_KEY FROM COLUMNS WHERE TABLE_SCHEMA = '${this.options.database}' AND TABLE_NAME = '${tableName}';`,
        (err, columns) => {
          if (err) {
            return reject(err);
          }
          this.getRelationsForTable(tableName).then(relations => {
            columns.forEach((result) => {
              const column = this.normalizeTableSchema(result);
              let relation = relations.filter(relation => relation.name === column.name).pop();
              if (relation) {
                column.foreignKey = true;
                column.dataType.references = relation;
                column.dataType.type = Utils.toTitleCase(relation.table);
                column.name = Utils.singular(relation.table);
              }
              table.columns.push(column);
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
      this.connection.query(
        `SELECT COLUMN_NAME, rc.REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM REFERENTIAL_CONSTRAINTS rc JOIN KEY_COLUMN_USAGE cu ON cu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME WHERE rc.CONSTRAINT_SCHEMA = '${this.options.database}' AND rc.TABLE_NAME = '${table}'`,
        (err, relations) => {
          if (err) {
            return reject(err);
          }
          resolve(relations.map(
            relation => {
              return {
                name: relation['COLUMN_NAME'],
                table: relation['REFERENCED_TABLE_NAME'],
                column: relation['REFERENCED_COLUMN_NAME'],
              }
            }
          ));
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
