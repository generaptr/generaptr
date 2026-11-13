import * as mysql from 'mysql2/promise';
import { DbTable } from '../commons/types';

/**
 * Reads a MySQL schema from information_schema.
 */
export default class MysqlHandler {
  private readonly pool: mysql.Pool;

  private readonly database: string | undefined;

  /**
   * @param options Connection parameters. `database` names the schema to read.
   */
  public constructor(options: mysql.ConnectionOptions) {
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
   * Reads every table as the database stores it: real column names, exact types, and foreign keys.
   */
  public async readTables(): Promise<DbTable[]> {
    const [columns] = await this.pool.query<mysql.RowDataPacket[]>(
      `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
        FROM COLUMNS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      [this.database],
    );
    const [keys] = await this.pool.query<mysql.RowDataPacket[]>(
      `SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [this.database],
    );
    const tables: Map<string, DbTable> = new Map();
    for (const row of columns) {
      const table: DbTable = tables.get(row.TABLE_NAME) ?? { name: row.TABLE_NAME, columns: [] };
      tables.set(row.TABLE_NAME, table);
      const key: mysql.RowDataPacket | undefined = keys.find(
        (k: mysql.RowDataPacket) => k.TABLE_NAME === row.TABLE_NAME && k.COLUMN_NAME === row.COLUMN_NAME,
      );
      table.columns.push({
        name: row.COLUMN_NAME,
        columnType: row.COLUMN_TYPE,
        nullable: row.IS_NULLABLE === 'YES',
        primary: row.COLUMN_KEY === 'PRI',
        unique: row.COLUMN_KEY === 'UNI',
        autoIncrement: String(row.EXTRA).includes('auto_increment'),
        references: key ? { table: key.REFERENCED_TABLE_NAME, column: key.REFERENCED_COLUMN_NAME } : undefined,
      });
    }

    return [...tables.values()];
  }

  /**
   * Closes the MySQL connection pool.
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}
