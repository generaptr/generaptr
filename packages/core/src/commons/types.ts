export type PackageJsonInfo = {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
};

export type Dialect = 'mysql' | 'postgresql';

/** A column as the database stores it. */
export type DbColumn = {
  name: string;
  /**
   * The database's own type: MySQL COLUMN_TYPE (`int unsigned`, `enum('a','b')`) or Postgres
   * `format_type()` (`character varying(255)`). Postgres enums use `enum('a','b')` with `enumName`.
   */
  columnType: string;
  /** Postgres only: the name of the enum type. */
  enumName?: string;
  nullable: boolean;
  autoIncrement: boolean;
  /** The column default as an SQL expression in the dialect's syntax, for example `now()` or `'x'`. */
  default?: string;
};

/** `no action` is the default and is never stored. */
export const REFERENTIAL_ACTIONS = ['restrict', 'cascade', 'set null', 'set default'] as const;
export type ReferentialAction = (typeof REFERENTIAL_ACTIONS)[number];

export type DbPrimaryKey = { name: string; columns: string[] };

export type DbUnique = { name: string; columns: string[]; nullsNotDistinct?: true };

export type DbForeignKey = {
  name: string;
  columns: string[];
  table: string;
  foreignColumns: string[];
  onDelete?: ReferentialAction;
  onUpdate?: ReferentialAction;
};

/** `expression` is SQL in the table's dialect, as the database prints it. */
export type DbCheck = { name: string; expression: string };

/**
 * Each key is SQL as the database prints it: a column or an expression, with its collation, operator class, and
 * order. `method` is left out for btree. `with` holds storage parameters.
 */
export type DbIndex = {
  name: string;
  unique?: true;
  method?: string;
  keys: string[];
  where?: string;
  with?: Record<string, string>;
};

/** Keys are constraints of the table, with the names the database gave them. */
export type DbTable = {
  name: string;
  columns: DbColumn[];
  primaryKey?: DbPrimaryKey;
  uniques?: DbUnique[];
  foreignKeys?: DbForeignKey[];
  checks?: DbCheck[];
  indexes?: DbIndex[];
};

/** Tables plus the dialect their column types are written in. */
export type DbSchema = {
  dialect: Dialect;
  tables: DbTable[];
};
