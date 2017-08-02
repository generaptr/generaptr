
export type RamlColumnSchema = {
  name: string;
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

export type DataType = {
  type: string;
  size?: number;
  rawValues?: string;
  values?: string[];
  isArray?: boolean;
  references?: TableReference;
};

export type Column = {
  name: string;
  primary: boolean;
  unique: boolean;
  foreignKey?: boolean;
  allowNull: boolean;
  dataType: DataType;
};

export type Table = {
  name: string;
  columns: Column[];
};

export type Schema = Table[];

export type StringMapOfStrings = {[key: string]: string[]};

export type Everything = string | number | Object | string[] | number[] | Object[] | {};

export type Cache = {
  [key: string]: {
    [key: string]: Everything;
  };
};

export type Example = {
  type: string;
  data: {
    [key: string]: Everything;
  };
};

export type RAMLApplicationInfo = {
  name: string;
  version: string;
  url: string;
};
