import { Pool, type PoolConfig } from 'pg';
import { DbSchema, DbTable } from '../commons/types';

type ColumnRow = {
  table_name: string;
  column_name: string;
  column_type: string;
  nullable: boolean;
  auto_increment: boolean;
  default_expr: string | null;
  enum_name: string | null;
  enum_values: string[] | null;
};

type ConstraintRow = {
  kind: 'p' | 'u' | 'f';
  table_name: string;
  column_name: string;
  width: number;
  ref_table: string | null;
  ref_column: string | null;
};

const COLUMNS: string = `
  SELECT c.relname AS table_name, a.attname AS column_name,
    format_type(a.atttypid, a.atttypmod) AS column_type,
    NOT a.attnotnull AS nullable,
    (a.attidentity <> '' OR coalesce(pg_get_expr(d.adbin, d.adrelid), '') LIKE 'nextval(%') AS auto_increment,
    pg_get_expr(d.adbin, d.adrelid) AS default_expr,
    CASE WHEN t.typtype = 'e' THEN t.typname END AS enum_name,
    CASE WHEN t.typtype = 'e' THEN
      (SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder) FROM pg_enum e WHERE e.enumtypid = t.oid)
    END AS enum_values
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_type t ON t.oid = a.atttypid
  LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE n.nspname = $1 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped
  ORDER BY c.relname, a.attnum`;

const CONSTRAINTS: string = `
  SELECT con.contype AS kind, src.relname AS table_name, sa.attname AS column_name,
    cardinality(con.conkey) AS width, ref.relname AS ref_table, ra.attname AS ref_column
  FROM pg_constraint con
  JOIN pg_class src ON src.oid = con.conrelid
  JOIN pg_namespace n ON n.oid = src.relnamespace
  JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
  JOIN pg_attribute sa ON sa.attrelid = con.conrelid AND sa.attnum = k.attnum
  LEFT JOIN pg_class ref ON ref.oid = con.confrelid
  LEFT JOIN pg_attribute ra ON ra.attrelid = con.confrelid AND ra.attnum = con.confkey[k.ord]
  WHERE n.nspname = $1 AND con.contype IN ('p', 'u', 'f')`;

/**
 * Reads a Postgres schema from pg_catalog.
 */
export default class PostgresHandler {
  private readonly pool: Pool;

  private readonly schema: string;

  /**
   * @param options Connection parameters. `schema` names the Postgres schema to read (default `public`).
   */
  public constructor(options: PoolConfig & { schema?: string }) {
    const { schema = 'public', ...config } = options;
    this.schema = schema;
    this.pool = new Pool({ ...config, port: Number(config.port ?? 5432), max: 2 });
  }

  /**
   * Checks that the connection data is valid.
   */
  public async connect(): Promise<void> {
    (await this.pool.connect()).release();
  }

  /**
   * Reads every table as the database stores it: real column names, exact types, keys, and enums.
   */
  public async readSchema(): Promise<DbSchema> {
    const { rows: columns } = await this.pool.query<ColumnRow>(COLUMNS, [this.schema]);
    const { rows: constraints } = await this.pool.query<ConstraintRow>(CONSTRAINTS, [this.schema]);
    const has = (kind: string, table: string, column: string, width?: number): ConstraintRow | undefined =>
      constraints.find((c: ConstraintRow) =>
        c.kind === kind && c.table_name === table && c.column_name === column && (width === undefined || c.width === width));

    const tables: Map<string, DbTable> = new Map();
    for (const row of columns) {
      const table: DbTable = tables.get(row.table_name) ?? { name: row.table_name, columns: [] };
      tables.set(row.table_name, table);
      const foreignKey: ConstraintRow | undefined = has('f', row.table_name, row.column_name, 1);
      const enumValues: string | undefined = row.enum_values
        ?.map((value: string) => `'${value.replace(/'/g, "''")}'`).join(',');
      table.columns.push({
        name: row.column_name,
        columnType: row.enum_name ? `enum(${enumValues})` : row.column_type,
        ...(row.enum_name ? { enumName: row.enum_name } : {}),
        nullable: row.nullable,
        primary: Boolean(has('p', row.table_name, row.column_name)),
        unique: Boolean(has('u', row.table_name, row.column_name, 1)),
        autoIncrement: row.auto_increment,
        ...(row.default_expr && !row.auto_increment ? { default: row.default_expr } : {}),
        ...(foreignKey?.ref_table && foreignKey.ref_column
          ? { references: { table: foreignKey.ref_table, column: foreignKey.ref_column } }
          : {}),
      });
    }

    return { dialect: 'postgresql', tables: [...tables.values()] };
  }

  /**
   * Closes the connection pool.
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}
