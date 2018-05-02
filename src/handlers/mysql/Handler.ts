import HandlerInterface from '../interfaces/HandlerInterface';
import Parser from './Parser';
import * as mysql from 'mysql2/promise';
import Schema from '../../types/Schema';
import Table from '../../types/Table';
import Column from '../../types/Column';
import ForeignKey from '../../types/ForeignKey';
import { RawMySqlColumn, TableReference } from './types';
import { toTitleCase, similarity, toColumnName } from '../../utils/text';

export default class Handler implements HandlerInterface<RawMySqlColumn> {

  private targetDatabase: String;
  private connection: mysql.Connection;
  private options: mysql.ConnectionOptions;
  private parser: Parser;

  public constructor(options: mysql.ConnectionOptions) {
    this.parser = new Parser();
    this.targetDatabase = String(options.database);
    this.options = options;
  }

  public getParser(): Parser {
    return this.parser;
  }

  public async getSchema(): Promise<Schema> {
    await this.connect();

    const tableNames: string[] = await this.getTableNames();
    const tables: Table[] = await Promise.all(
      tableNames.map(
        async (name: string) => this.getTable(name),
      ),
    );
    const schema: Schema = (new Schema()).setTables(tables);
    await this.connection.end();

    return this.parser.normalizeRelations(schema);
  }

  private async connect(): Promise<boolean> {
    const connection: mysql.Connection = await mysql.createConnection({
      ...this.options,
      database: 'information_schema',
    });

    this.connection = connection;
    
    return true;
  }

  private async getTableNames(): Promise<string[]> {
    const [rows] = await this.connection.execute('SELECT TABLE_NAME FROM TABLES WHERE TABLE_SCHEMA = ?', [this.targetDatabase]);

    return (rows as mysql.RowDataPacket[]).map((row: mysql.RowDataPacket) => row.TABLE_NAME);
  }

  private async getTable(name: string): Promise<Table> {
    const [rows] = await this.connection.execute(
      'SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_KEY, COLUMN_TYPE FROM COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
      [this.targetDatabase,  name],
    );
    const relations: TableReference[] = await this.getTableRelations(name);
    const columns: Column[] = (rows as mysql.RowDataPacket[]).map((row: mysql.RowDataPacket) => {
      const column: Column = this.parser.normalizeColumn({
        COLUMN_NAME: row.COLUMN_NAME,
        COLUMN_KEY: row.COLUMN_KEY,
        COLUMN_TYPE: row.COLUMN_TYPE,
        IS_NULLABLE: row.IS_NULLABLE,
        DATA_TYPE: row.DATA_TYPE,
      });
      
      const relation: TableReference | undefined = relations.find(
        (rel: TableReference) => rel.name === column.getName(),
      );
      if (relation) {
        const foreignKey: ForeignKey = new ForeignKey();
        foreignKey
          .setTarget({table: relation.table, column: relation.column})
          .setSource({table: name, column: relation.name})
          .setAlias(similarity(column.getName(), relation.table) < 0.5);
        column
          .setForeignKey(foreignKey)
          .setType(column.getType().setType(toTitleCase(relation.table)))
          .setName((rows as mysql.RowDataPacket[]).length === relations.length ? relation.name : toColumnName(relation.name));
      }

      return column;
    });
    const table: Table = new Table();

    return table
      .setName(name)
      .setColumns(columns)
      .setCrossReference(columns.length === relations.length)
      .setForeignKeys(relations.length > 0);
      
  }

  private async getTableRelations(name: string): Promise<TableReference[]> {
    const [rows] = await this.connection.execute(
      'SELECT COLUMN_NAME, rc.REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM REFERENTIAL_CONSTRAINTS rc JOIN KEY_COLUMN_USAGE cu ON cu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME WHERE rc.CONSTRAINT_SCHEMA = ? AND rc.TABLE_NAME = ?',
      [this.targetDatabase, name],
    );

    return (rows as mysql.RowDataPacket[]).map((row: mysql.RowDataPacket) =>
      ({
        name: row.COLUMN_NAME,
        table: row.REFERENCED_TABLE_NAME,
        column: row.REFERENCED_COLUMN_NAME,
      })
    );
  }
}
