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
  /** MySQL AUTO_INCREMENT, or a Postgres serial: a default of `nextval` on the sequence that the column owns. */
  autoIncrement: boolean;
  /** The column default as an SQL expression in the dialect's syntax, for example `now()` or `'x'`. */
  default?: string;
  /** The SQL that computes a generated column. Postgres has stored ones only. */
  generated?: { expression: string; virtual?: true };
  /** A Postgres identity column and its sequence, with every option the sequence has. */
  identity?: DbIdentity;
  /** MySQL `ON UPDATE CURRENT_TIMESTAMP`. */
  onUpdateNow?: true;
  /** The collation, when it is not the default for the column's type. */
  collation?: string;
};

/** Sequence values are strings: a bigint maximum does not fit a JS number. */
export type DbSequence = {
  name: string;
  start: string;
  increment: string;
  min: string;
  max: string;
  cache: string;
  cycle: boolean;
};

export type DbIdentity = DbSequence & { always: boolean };

export type DbEnum = { name: string; values: string[] };

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
  /** Postgres enums that no column uses. */
  enums?: DbEnum[];
  /** Postgres sequences that no column owns. */
  sequences?: DbSequence[];
};
