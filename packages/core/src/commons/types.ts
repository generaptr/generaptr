export type PackageJsonInfo = {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
};

/** A column as the database stores it, read from information_schema. */
export type DbColumn = {
  name: string;
  /** MySQL COLUMN_TYPE, for example `int unsigned`, `varchar(255)`, `enum('a','b')`. */
  columnType: string;
  nullable: boolean;
  primary: boolean;
  unique: boolean;
  autoIncrement: boolean;
  references?: { table: string; column: string };
};

export type DbTable = {
  name: string;
  columns: DbColumn[];
};
