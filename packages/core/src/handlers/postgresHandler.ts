import { Pool, type PoolConfig } from 'pg';
import { splitList } from '../commons/columns.js';
import { DbForeignKey, DbIndex, DbSchema, DbTable, ReferentialAction } from '../commons/types.js';

type ColumnRow = {
  table_name: string;
  column_name: string;
  column_type: string;
  nullable: boolean;
  auto_increment: boolean;
  default_expr: string | null;
  generated: '' | 's' | 'v';
  identity: '' | 'a' | 'd';
  sequence: { name: string; start: string; increment: string; min: string; max: string; cache: string; cycle: boolean } | null;
  collation: string | null;
  enum_name: string | null;
  enum_values: string[] | null;
};

type ConstraintRow = {
  name: string;
  kind: 'p' | 'u' | 'f' | 'c' | 'x';
  table_name: string;
  columns: string[];
  ref_table: string | null;
  ref_columns: string[];
  on_delete: string;
  on_update: string;
  nulls_not_distinct: boolean;
  expression: string | null;
};

type IndexRow = {
  table_name: string;
  name: string;
  method: string;
  is_unique: boolean;
  definition: string;
  where_expr: string | null;
  options: string[] | null;
  has_include: boolean;
  nulls_not_distinct: boolean;
};

/** pg_constraint action codes. `a` (no action) is the default and is not stored. */
const ACTIONS: Record<string, ReferentialAction | undefined> = {
  r: 'restrict', c: 'cascade', n: 'set null', d: 'set default',
};

const COLUMNS: string = `
  SELECT c.relname AS table_name, a.attname AS column_name,
    format_type(a.atttypid, a.atttypmod) AS column_type,
    NOT a.attnotnull AS nullable,
    coalesce(pg_get_expr(d.adbin, d.adrelid), '') LIKE 'nextval(%' AS auto_increment,
    pg_get_expr(d.adbin, d.adrelid) AS default_expr,
    a.attgenerated AS generated, a.attidentity AS identity,
    CASE WHEN a.attidentity <> '' THEN (
      SELECT json_build_object('name', s.relname, 'start', q.seqstart::text, 'increment', q.seqincrement::text,
        'min', q.seqmin::text, 'max', q.seqmax::text, 'cache', q.seqcache::text, 'cycle', q.seqcycle)
      FROM pg_sequence q JOIN pg_class s ON s.oid = q.seqrelid
      WHERE q.seqrelid = pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname)::regclass
    ) END AS sequence,
    CASE WHEN a.attcollation <> t.typcollation THEN
      (SELECT co.collname FROM pg_collation co WHERE co.oid = a.attcollation)
    END AS collation,
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
  WHERE n.nspname = $1 AND con.contype IN ('p', 'u', 'f', 'c', 'x')
  ORDER BY src.relname, con.conname`;

// Indexes that back a constraint belong to the constraint.
const INDEXES: string = `
  SELECT c.relname AS table_name, ic.relname AS name, am.amname AS method, i.indisunique AS is_unique,
    pg_get_indexdef(i.indexrelid) AS definition, pg_get_expr(i.indpred, i.indrelid) AS where_expr,
    ic.reloptions AS options, i.indnatts > i.indnkeyatts AS has_include,
    coalesce((to_jsonb(i) ->> 'indnullsnotdistinct')::boolean, false) AS nulls_not_distinct
  FROM pg_index i
  JOIN pg_class c ON c.oid = i.indrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_class ic ON ic.oid = i.indexrelid
  JOIN pg_am am ON am.oid = ic.relam
  WHERE n.nspname = $1 AND NOT EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conindid = i.indexrelid)
  ORDER BY c.relname, ic.relname`;

/** Drizzle cannot write these, so a schema with one cannot be rebuilt. */
const unsupportedIndex = (row: IndexRow): string | undefined => {
  if (row.has_include) {
    return 'INCLUDE columns';
  }
  return row.is_unique && row.nulls_not_distinct ? 'NULLS NOT DISTINCT on a unique index' : undefined;
};

/** Keys from `CREATE INDEX ... USING method (keys) ...`, each with its collation, operator class, and order. */
const indexOf = (row: IndexRow): DbIndex => {
  const using: string = ` USING ${row.method} (`;
  const options: [string, string][] = (row.options ?? []).map((option: string) => {
    const [key, ...value] = option.split('=');
    return [key, value.join('=')];
  });

  return {
    name: row.name,
    ...(row.is_unique ? { unique: true as const } : {}),
    ...(row.method === 'btree' ? {} : { method: row.method }),
    keys: splitList(row.definition, row.definition.indexOf(using) + using.length),
    ...(row.where_expr ? { where: row.where_expr } : {}),
    ...(options.length ? { with: Object.fromEntries(options) } : {}),
  };
};

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
    const { rows: indexes } = await this.pool.query<IndexRow>(INDEXES, [this.schema]);

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
        ...(row.default_expr && !row.auto_increment && !row.generated ? { default: row.default_expr } : {}),
        ...(row.generated && row.default_expr
          ? { generated: { expression: row.default_expr, ...(row.generated === 'v' ? { virtual: true as const } : {}) } }
          : {}),
        ...(row.identity && row.sequence ? { identity: { always: row.identity === 'a', ...row.sequence } } : {}),
        ...(row.collation ? { collation: row.collation } : {}),
      });
    }
    for (const row of constraints) {
      const table: DbTable | undefined = tables.get(row.table_name);
      if (!table) {
        continue;
      }
      if (row.kind === 'x') {
        throw new Error(`Unsupported constraint ${row.name} on ${row.table_name}: Drizzle has no exclusion constraints`);
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

    for (const row of indexes) {
      const unsupported: string | undefined = unsupportedIndex(row);
      if (unsupported) {
        throw new Error(`Unsupported index ${row.name} on ${row.table_name}: Drizzle has no ${unsupported}`);
      }
      const table: DbTable | undefined = tables.get(row.table_name);
      if (table) {
        table.indexes = [...table.indexes ?? [], indexOf(row)];
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
