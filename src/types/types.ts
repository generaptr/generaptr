export type RamlColumnSchema = {
  name: string;
  displayName: string;
  typePropertyKind: string;
  type: string[];
  required: boolean;
  items: string;
};

export type RamlType = {
  name(): string;
  toJSON(value: Object): {
    [key: string]: {
      properties: RamlColumnSchema[];
    };
  };
};

export type MySqlColumnSchema = {
  COLUMN_NAME: string;
  COLUMN_KEY: string;
  COLUMN_TYPE: string;
  IS_NULLABLE: string;
  DATA_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH?: string;
};

export type RawTableReference = {
  COLUMN_NAME: string;
  REFERENCED_TABLE_NAME: string;
  REFERENCED_COLUMN_NAME: string;
};

export type TableReference = {
  name: string;
  table: string;
  column: string;
};
