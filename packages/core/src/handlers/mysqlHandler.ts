import * as mysql from 'mysql2/promise';
import { DbForeignKey, DbIndex, DbSchema, DbTable, ReferentialAction } from '../commons/types.js';

/** MySQL stores literal defaults unquoted and marks expressions with DEFAULT_GENERATED. */
const defaultOf = (row: mysql.RowDataPacket, autoIncrement: boolean): string | undefined => {
  if (row.COLUMN_DEFAULT === null || autoIncrement) {
    return undefined;
  }
  if (String(row.EXTRA).includes('DEFAULT_GENERATED')) {
    return String(row.COLUMN_DEFAULT);
  }
  return /^(tinyint|smallint|mediumint|int|bigint|decimal|float|double|year|bit)\b/.test(row.COLUMN_TYPE)
    ? String(row.COLUMN_DEFAULT)
    : `'${String(row.COLUMN_DEFAULT).replace(/'/g, "''")}'`;
};

/** REFERENTIAL_CONSTRAINTS rules. `NO ACTION` is the default and is not stored. */
const action = (rule: string): ReferentialAction | undefined =>
  rule === 'NO ACTION' ? undefined : rule.toLowerCase() as ReferentialAction;

// One row per key column, in key order. Foreign keys carry their target and rules.
const KEYS: string = `
  SELECT c.CONSTRAINT_NAME, c.TABLE_NAME, c.CONSTRAINT_TYPE, k.COLUMN_NAME,
    k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME, r.UPDATE_RULE, r.DELETE_RULE
  FROM TABLE_CONSTRAINTS c
  JOIN KEY_COLUMN_USAGE k ON k.CONSTRAINT_SCHEMA = c.CONSTRAINT_SCHEMA
    AND k.TABLE_NAME = c.TABLE_NAME AND k.CONSTRAINT_NAME = c.CONSTRAINT_NAME
  LEFT JOIN REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA = c.CONSTRAINT_SCHEMA
    AND r.TABLE_NAME = c.TABLE_NAME AND r.CONSTRAINT_NAME = c.CONSTRAINT_NAME
  WHERE c.CONSTRAINT_SCHEMA = ? AND c.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'FOREIGN KEY')
  ORDER BY c.TABLE_NAME, c.CONSTRAINT_NAME, k.ORDINAL_POSITION`;

// Unique keys come from here too: KEY_COLUMN_USAGE has no row for an expression or a prefix.
const INDEXES: string = `
  SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, COLUMN_NAME, SUB_PART, COLLATION, INDEX_TYPE, EXPRESSION
  FROM STATISTICS
  WHERE TABLE_SCHEMA = ? AND INDEX_NAME <> 'PRIMARY'
  ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`;

/**
 * CHECK_CLAUSE and STATISTICS.EXPRESSION escape quotes and backslashes once more than the SQL they hold. A quote in
 * a literal then becomes '' so the SQL holds no backslash, which an OpenAPI document may not carry.
 */
const printedSql = (text: string): string => text.replace(/\\(.)/g, '$1').replace(/\\'/g, "''");

/** One key of an index as SQL: a column with its prefix length, or an expression, then its order. */
const indexKey = (row: mysql.RowDataPacket): string =>
  (row.COLUMN_NAME === null ? `(${printedSql(row.EXPRESSION)})` : `\`${row.COLUMN_NAME}\`${row.SUB_PART === null ? '' : `(${row.SUB_PART})`}`)
  + (row.COLLATION === 'D' ? ' DESC' : '');

const CHECKS: string = `
  SELECT t.TABLE_NAME, c.CONSTRAINT_NAME, c.CHECK_CLAUSE
  FROM CHECK_CONSTRAINTS c
  JOIN TABLE_CONSTRAINTS t ON t.CONSTRAINT_SCHEMA = c.CONSTRAINT_SCHEMA
    AND t.CONSTRAINT_NAME = c.CONSTRAINT_NAME AND t.CONSTRAINT_TYPE = 'CHECK'
  WHERE c.CONSTRAINT_SCHEMA = ?
  ORDER BY t.TABLE_NAME, c.CONSTRAINT_NAME`;

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
  public async readSchema(): Promise<DbSchema> {
    const [columns] = await this.pool.query<mysql.RowDataPacket[]>(
      `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, EXTRA, COLUMN_DEFAULT
        FROM COLUMNS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      [this.database],
    );
    const [keys] = await this.pool.query<mysql.RowDataPacket[]>(KEYS, [this.database]);
    const tables: Map<string, DbTable> = new Map();
    for (const row of columns) {
      const table: DbTable = tables.get(row.TABLE_NAME) ?? { name: row.TABLE_NAME, columns: [] };
      tables.set(row.TABLE_NAME, table);
      const autoIncrement: boolean = String(row.EXTRA).includes('auto_increment');
      const defaultValue: string | undefined = defaultOf(row, autoIncrement);
      table.columns.push({
        name: row.COLUMN_NAME,
        columnType: row.COLUMN_TYPE,
        nullable: row.IS_NULLABLE === 'YES',
        autoIncrement,
        ...(defaultValue === undefined ? {} : { default: defaultValue }),
      });
    }
    for (const row of keys) {
      const table: DbTable | undefined = tables.get(row.TABLE_NAME);
      if (!table) {
        continue;
      }
      if (row.CONSTRAINT_TYPE === 'PRIMARY KEY') {
        table.primaryKey ??= { name: row.CONSTRAINT_NAME, columns: [] };
        table.primaryKey.columns.push(row.COLUMN_NAME);
      } else {
        table.foreignKeys ??= [];
        const key: DbForeignKey | undefined = table.foreignKeys.find((k: DbForeignKey) => k.name === row.CONSTRAINT_NAME);
        if (key) {
          key.columns.push(row.COLUMN_NAME);
          key.foreignColumns.push(row.REFERENCED_COLUMN_NAME);
        } else {
          const onDelete: ReferentialAction | undefined = action(row.DELETE_RULE);
          const onUpdate: ReferentialAction | undefined = action(row.UPDATE_RULE);
          table.foreignKeys.push({
            name: row.CONSTRAINT_NAME, columns: [row.COLUMN_NAME],
            table: row.REFERENCED_TABLE_NAME, foreignColumns: [row.REFERENCED_COLUMN_NAME],
            ...(onDelete ? { onDelete } : {}), ...(onUpdate ? { onUpdate } : {}),
          });
        }
      }
    }

    const [indexRows] = await this.pool.query<mysql.RowDataPacket[]>(INDEXES, [this.database]);
    const indexes: Map<string, mysql.RowDataPacket[]> = new Map();
    for (const row of indexRows) {
      const key = `${row.TABLE_NAME}.${row.INDEX_NAME}`;
      indexes.set(key, [...indexes.get(key) ?? [], row]);
    }
    for (const rows of indexes.values()) {
      const [first] = rows;
      if (first.INDEX_TYPE === 'FULLTEXT' || first.INDEX_TYPE === 'SPATIAL') {
        throw new Error(`Unsupported index ${first.INDEX_NAME} on ${first.TABLE_NAME}: Drizzle has no ${first.INDEX_TYPE} index`);
      }
      const table: DbTable | undefined = tables.get(first.TABLE_NAME);
      if (!table) {
        continue;
      }
      const unique: boolean = Number(first.NON_UNIQUE) === 0;
      const plain: boolean = rows.every((row: mysql.RowDataPacket) =>
        row.COLUMN_NAME !== null && row.SUB_PART === null && row.COLLATION !== 'D');
      if (unique && plain) {
        table.uniques = [...table.uniques ?? [], {
          name: first.INDEX_NAME, columns: rows.map((row: mysql.RowDataPacket) => row.COLUMN_NAME),
        }];
      } else {
        const index: DbIndex = {
          name: first.INDEX_NAME, ...(unique ? { unique: true as const } : {}), keys: rows.map(indexKey),
        };
        table.indexes = [...table.indexes ?? [], index];
      }
    }

    const [checks] = await this.pool.query<mysql.RowDataPacket[]>(CHECKS, [this.database]);
    for (const row of checks) {
      const table: DbTable | undefined = tables.get(row.TABLE_NAME);
      if (table) {
        table.checks = [...table.checks ?? [], { name: row.CONSTRAINT_NAME, expression: printedSql(row.CHECK_CLAUSE) }];
      }
    }

    return { dialect: 'mysql', tables: [...tables.values()] };
  }

  /**
   * Closes the MySQL connection pool.
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}
