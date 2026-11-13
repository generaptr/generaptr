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
  primary: boolean;
  unique: boolean;
  autoIncrement: boolean;
  /** The column default as an SQL expression in the dialect's syntax, for example `now()` or `'x'`. */
  default?: string;
  references?: { table: string; column: string };
};

export type DbTable = {
  name: string;
  columns: DbColumn[];
};

/** Tables plus the dialect their column types are written in. */
export type DbSchema = {
  dialect: Dialect;
  tables: DbTable[];
};
