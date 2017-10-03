import * as mysql from 'mysql';
import Utils from '../commons/utils/utils';
import BaseHandler from './BaseHandler';
import { Schema, Table, Column, MySqlColumnSchema, TableReference, RawTableReference } from '../commons/types';

/**
 * MySql Handler.
 *
 * @export
 * @class MysqlHandler
 * @extends {BaseHandler}
 */
export default class MysqlHandler extends BaseHandler {
  /**
   * Mysql connection object.
   *
   * @private
   * @type {mysql.Connection}
   * @memberof MysqlHandler
   */
  private connection: mysql.IConnection;

  /**
   * Mysql connection options
   *
   * @private
   * @type {mysql.IConnectionConfig}
   * @memberof MysqlHandler
   */
  private options: mysql.IConnectionConfig;
  /**
   * Constructor for the MySqlHandler.
   *
   * @param {mysq.IConnectionConfig} options Connection parameters.
   */
  public constructor(options: mysql.IConnectionConfig) {
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
  public connect(): void {
    this.connection.connect();
  }

  /**
   * Reads the database schema, processes it and returns a normalized version of it.
   *
   * @returns {Promise<Schema>} database schema
   */
  public async readSchema(): Promise<Schema> {
    return new Promise<Schema>((resolve: (schema: Schema) => void, reject: (reason: Error) => void): void => {
      this.getTables().then((tablesNames: string[]) => {
        const tables: Promise<Table>[] = tablesNames.map(async (tableName: string) => this.getTableSchema(tableName));

        Promise.all(tables).then((schema: Schema) => {
          resolve(this.normalizeRelations(schema));
        }).catch(reject);
      }).catch(reject);
    });
  }

  /**
   * Reads the information schema and returns an array of tables.
   *
   * @returns {Promise<string[]>} array of table names.
   */
  public async getTables(): Promise<string[]> {
    return new Promise<string[]>((resolve: (tables: string[]) => void, reject: (reason: Error) => void): void => {
      this.connection.query(
        `SELECT TABLE_NAME FROM TABLES WHERE TABLE_SCHEMA = '${this.options.database}';`,
        (err: Error, results: [{TABLE_NAME: string}]) => {
          /* istanbul ignore next */
          if (err) {
            return reject(err);
          }
          const tables: string[] = results.map((result: {TABLE_NAME: string}) => result.TABLE_NAME);

          return resolve(tables);
        },
      );
    });
  }

  /**
   * Reads the schema for a given table.
   *
   * @param {string} tableName table name
   * @returns {Promise<Table>} table schema
   */
  public async getTableSchema(tableName: string): Promise<Table> {
    return new Promise<Table>((resolve: (table: Table) => void, reject: (reason: Error) => void): void => {
      const table: Table = {
        name: tableName,
        columns: [],
      };

      this.connection.query(
        `SELECT
          COLUMN_NAME,
          IS_NULLABLE,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          COLUMN_KEY,
          COLUMN_TYPE
        FROM COLUMNS WHERE TABLE_SCHEMA = '${this.options.database}' AND TABLE_NAME = '${tableName}';`,
        (err: Error, columns: MySqlColumnSchema[]) => {
          /* istanbul ignore next */
          if (err) {
            return reject(err);
          }
          this.getRelationsForTable(tableName).then((relations: TableReference[]) => {
            columns.forEach((result: MySqlColumnSchema) => {
              const column: Column = this.normalizeColumnSchema(result);
              const relation: TableReference | undefined = relations.find(
                (rel: TableReference) => rel.name === column.name,
              );
              if (relation) {
                column.foreignKey = true;
                column.dataType.references = relation;
                column.dataType.type = Utils.toTitleCase(relation.table);
                column.name = Utils.singular(relation.table);
              }
              table.columns.push(column);
            });

            return resolve(table);
          }).catch(reject);
        },
      );
    });
  }

  /**
   * Reads all the relations for a given table.
   *
   * @param {string} table table name
   * @return {Promise<TableReference[]>} foreign key relations
   */
  public async getRelationsForTable(table: string): Promise<TableReference[]> {
    return new Promise<TableReference[]>(
      (resolve: (references: TableReference[]) => void, reject: (reason: Error) => void): void => {
        this.connection.query(
        `SELECT
          COLUMN_NAME,
          rc.REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM REFERENTIAL_CONSTRAINTS rc JOIN
          KEY_COLUMN_USAGE cu ON cu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
        WHERE rc.CONSTRAINT_SCHEMA = '${this.options.database}' AND rc.TABLE_NAME = '${table}'`,
        (err: Error, relations: RawTableReference[]) => {
          /* istanbul ignore next */
          if (err) {
            return reject(err);
          }

          const references: TableReference[] = relations.map((relation: RawTableReference) => {
            const reference: TableReference = {
              name: relation.COLUMN_NAME,
              table: relation.REFERENCED_TABLE_NAME,
              column: relation.REFERENCED_COLUMN_NAME,
            };

            return reference;
          });

          resolve(references);
        },
      );
    },
  );
}

  /**
   * Closes the MySql connection.
   */
  public close(): void {
    this.connection.end();
  }
}
