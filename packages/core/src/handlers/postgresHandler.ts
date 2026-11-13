import { Pool, type PoolConfig } from 'pg';
import { DbForeignKey, DbSchema, DbTable, ReferentialAction } from '../commons/types.js';

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
  name: string;
  kind: 'p' | 'u' | 'f' | 'c';
  table_name: string;
  columns: string[];
  ref_table: string | null;
  ref_columns: string[];
  on_delete: string;
  on_update: string;
  nulls_not_distinct: boolean;
  expression: string | null;
};

/** pg_constraint action codes. `a` (no action) is the default and is not stored. */
const ACTIONS: Record<string, ReferentialAction | undefined> = {
  r: 'restrict', c: 'cascade', n: 'set null', d: 'set default',
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

// Column lists keep key order. to_jsonb reads indnullsnotdistinct, which Postgres before 15 does not have.
const CONSTRAINTS: string = `
  SELECT con.conname AS name, con.contype AS kind, src.relname AS table_name,
    array(SELECT a.attname FROM unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord)
      JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum ORDER BY k.ord)::text[] AS columns,
    ref.relname AS ref_table,
    array(SELECT a.attname FROM unnest(con.confkey) WITH ORDINALITY AS k(attnum, ord)
      JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.attnum ORDER BY k.ord)::text[] AS ref_columns,
    con.confdeltype AS on_delete, con.confupdtype AS on_update,
    coalesce((to_jsonb(i) ->> 'indnullsnotdistinct')::boolean, false) AS nulls_not_distinct,
    CASE WHEN con.contype = 'c' THEN pg_get_expr(con.conbin, con.conrelid) END AS expression
  FROM pg_constraint con
  JOIN pg_class src ON src.oid = con.conrelid
  JOIN pg_namespace n ON n.oid = src.relnamespace
  LEFT JOIN pg_class ref ON ref.oid = con.confrelid
  LEFT JOIN pg_index i ON i.indexrelid = con.conindid AND con.contype = 'u'
  WHERE n.nspname = $1 AND con.contype IN ('p', 'u', 'f', 'c')
  ORDER BY src.relname, con.conname`;

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

    const tables: Map<string, DbTable> = new Map();
    for (const row of columns) {
      const table: DbTable = tables.get(row.table_name) ?? { name: row.table_name, columns: [] };
      tables.set(row.table_name, table);
      const enumValues: string | undefined = row.enum_values
        ?.map((value: string) => `'${value.replace(/'/g, "''")}'`).join(',');
      table.columns.push({
        name: row.column_name,
        columnType: row.enum_name ? `enum(${enumValues})` : row.column_type,
        ...(row.enum_name ? { enumName: row.enum_name } : {}),
        nullable: row.nullable,
        autoIncrement: row.auto_increment,
        ...(row.default_expr && !row.auto_increment ? { default: row.default_expr } : {}),
      });
    }
    for (const row of constraints) {
      const table: DbTable | undefined = tables.get(row.table_name);
      if (!table) {
        continue;
      }
      if (row.kind === 'p') {
        table.primaryKey = { name: row.name, columns: row.columns };
      } else if (row.kind === 'u') {
        table.uniques = [...table.uniques ?? [], {
          name: row.name, columns: row.columns, ...(row.nulls_not_distinct ? { nullsNotDistinct: true } : {}),
        }];
      } else if (row.kind === 'c') {
        table.checks = [...table.checks ?? [], { name: row.name, expression: row.expression as string }];
      } else if (row.ref_table) {
        const onDelete: ReferentialAction | undefined = ACTIONS[row.on_delete];
        const onUpdate: ReferentialAction | undefined = ACTIONS[row.on_update];
        const key: DbForeignKey = {
          name: row.name, columns: row.columns, table: row.ref_table, foreignColumns: row.ref_columns,
          ...(onDelete ? { onDelete } : {}), ...(onUpdate ? { onUpdate } : {}),
        };
        table.foreignKeys = [...table.foreignKeys ?? [], key];
      }
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
