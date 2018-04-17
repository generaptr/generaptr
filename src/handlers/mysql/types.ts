export type RawMySqlColumn = {
  COLUMN_NAME: string;
  COLUMN_KEY: string;
  COLUMN_TYPE: string;
  IS_NULLABLE: string;
  DATA_TYPE: string;
};

export type TableReference = {
  name: string;
  table: string;
  column: string;
};
