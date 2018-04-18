export type RawRamlColumn = {
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
      properties: RawRamlColumn[];
    };
  };
};
