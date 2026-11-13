import * as mysql from 'mysql2/promise';
import Utils from '../commons/utils/utils';
import BaseHandler from './baseHandler';
import { Schema, Table, Column, MySqlColumnSchema, TableReference, RawTableReference } from '../commons/types';

/**
 * MySql Handler.
 *
 * @export
 */
export default class MysqlHandler extends BaseHandler {
  private readonly pool: mysql.Pool;

  private readonly database: string | undefined;

  /**
   * @param options Connection parameters. `database` names the schema to read.
   */
  public constructor(options: mysql.ConnectionOptions) {
    super('mysql');

    this.database = options.database;
    this.pool = mysql.createPool({
      host: options.host,
      port: Number(options.port),
      user: options.user,
      password: options.password,
      database: 'information_schema',
      connectionLimit: 4,
    });
  }

  /**
   * Checks that the connection data is valid.
   */
  public async connect(): Promise<void> {
    (await this.pool.getConnection()).release();
  }

  /**
   * Reads the database schema, processes it and returns a normalized version of it.
   */
  public async readSchema(): Promise<Schema> {
    const tableNames: string[] = await this.getTables();
    const schema: Schema = await Promise.all(tableNames.map(async (name: string) => this.getTableSchema(name)));

    return this.normalizeRelations(schema);
  }

  /**
   * Reads the information schema and returns an array of tables.
   */
  public async getTables(): Promise<string[]> {
    const [rows] = await this.pool.query<(mysql.RowDataPacket & { TABLE_NAME: string })[]>(
      'SELECT TABLE_NAME FROM TABLES WHERE TABLE_SCHEMA = ?',
      [this.database],
    );

    return rows.map((row: { TABLE_NAME: string }) => row.TABLE_NAME);
  }

  /**
   * Reads the schema for a given table.
   */
  public async getTableSchema(tableName: string): Promise<Table> {
    const [columns] = await this.pool.query<(mysql.RowDataPacket & MySqlColumnSchema)[]>(
      `SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_KEY, COLUMN_TYPE
        FROM COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
      [this.database, tableName],
    );
    const relations: TableReference[] = await this.getRelationsForTable(tableName);

    return {
      name: tableName,
      columns: columns.map((raw: MySqlColumnSchema) => {
        const column: Column = this.normalizeColumnSchema(raw);
        const relation: TableReference | undefined = relations.find((rel: TableReference) => rel.name === column.name);
        if (relation) {
          column.foreignKey = true;
          column.dataType.references = relation;
          column.dataType.type = Utils.toTitleCase(relation.table);
          column.name = Utils.singular(relation.table);
        }

        return column;
      }),
    };
  }

  /**
   * Reads all the foreign key relations for a given table.
   */
  public async getRelationsForTable(table: string): Promise<TableReference[]> {
    const [relations] = await this.pool.query<(mysql.RowDataPacket & RawTableReference)[]>(
      `SELECT COLUMN_NAME, rc.REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM REFERENTIAL_CONSTRAINTS rc
        JOIN KEY_COLUMN_USAGE cu ON cu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME AND cu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
        WHERE rc.CONSTRAINT_SCHEMA = ? AND rc.TABLE_NAME = ?`,
      [this.database, table],
    );

    return relations.map((relation: RawTableReference) => ({
      name: relation.COLUMN_NAME,
      table: relation.REFERENCED_TABLE_NAME,
      column: relation.REFERENCED_COLUMN_NAME,
    }));
  }

  /**
   * Closes the MySql connection.
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}
