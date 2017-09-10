export default {
  PROCESSED_SCHEMA_ONE_TABLE: [
    {
      name: 'users',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'firstName',
          primary: false,
          unique: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'lastName',
          primary: false,
          unique: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'email',
          primary: false,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 50,
          },
        },
      ],
    },
  ],
  PROCESSED_SCHEMA_ONE_TO_ONE: [
    {
      name: 'accounts',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'type',
          primary: false,
          unique: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'user',
          unique: true,
          allowNull: false,
          primary: false,
          dataType: {
            type: 'User',
            isArray: false,
            relationType: '1-1',
          },
        },
      ],
    },
    {
      name: 'users',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'firstName',
          primary: false,
          unique: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'lastName',
          primary: false,
          unique: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'email',
          primary: false,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 50,
          },
        },
        {
          name: 'account',
          unique: true,
          allowNull: false,
          primary: false,
          dataType: {
            type: 'Account',
            isArray: false,
            relationType: '1-1',
          },
        },
      ],
    },
  ],
  PROCESSED_SCHEMA_MANY_TO_ONE: [
    {
      name: 'accounts',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'type',
          primary: false,
          unique: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'applications',
          primary: false,
          unique: false,
          allowNull: true,
          dataType: {
            type: 'Application',
            isArray: true,
            relationType: '1-n',
          },
        },
      ],
    },
    {
      name: 'applications',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'name',
          primary: false,
          unique: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'account',
          unique: false,
          allowNull: false,
          primary: false,
          dataType: {
            type: 'Account',
            isArray: false,
            relationType: '1-1',
          },
        },
      ],
    },
  ],
  PROCESSED_SCHEMA_MANY_TO_MANY: [
    {
      name: 'groups',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'name',
          primary: false,
          unique: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'users',
          primary: false,
          unique: false,
          allowNull: true,
          dataType: {
            type: 'User',
            isArray: true,
            relationType: 'n-n',
          },
        },
      ],
    },
    {
      name: 'users',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'firstName',
          primary: false,
          unique: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'lastName',
          primary: false,
          unique: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'email',
          primary: false,
          unique: true,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 50,
          },
        },
        {
          name: 'groups',
          primary: false,
          unique: false,
          allowNull: true,
          dataType: {
            type: 'Group',
            isArray: false,
            relationType: 'n-n',
          },
        },
      ],
    },
  ],
  SCHEMA_ONE_TABLE: [
    {
      name: 'users',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'firstName',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'lastName',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'email',
          primary: false,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 50,
          },
        },
      ],
    }],
  SCHEMA_ONE_TO_ONE: [
    {
      name: 'accounts',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'type',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'user',
          primary: false,
          unique: true,
          foreignKey: true,
          allowNull: false,
          dataType: {
            type: 'User',
            size: undefined,
            references: {
              name: 'user_id',
              table: 'users',
              column: 'id',
            },
          },
        },
      ],
    },
    {
      name: 'users',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'firstName',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'lastName',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'email',
          primary: false,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 50,
          },
        },
      ],
    },
  ],
  SCHEMA_MANY_TO_ONE: [
    {
      name: 'accounts',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'type',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
      ],
    },
    {
      name: 'applications',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'name',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'account',
          primary: false,
          unique: false,
          foreignKey: true,
          allowNull: false,
          dataType: {
            type: 'Account',
            size: undefined,
            references: {
              name: 'account_id',
              table: 'accounts',
              column: 'id',
            },
          },
        },
      ],
    },
  ],
  SCHEMA_MANY_TO_MANY: [
    {
      name: 'groups',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'name',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
      ],
    },
    {
      name: 'users',
      columns: [
        {
          name: 'id',
          primary: true,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'number',
            size: undefined,
          },
        },
        {
          name: 'firstName',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'lastName',
          primary: false,
          unique: false,
          foreignKey: false,
          allowNull: true,
          dataType: {
            type: 'string',
            size: 255,
          },
        },
        {
          name: 'email',
          primary: false,
          unique: true,
          foreignKey: false,
          allowNull: false,
          dataType: {
            type: 'string',
            size: 50,
          },
        },
      ],
    },
    {
      name: 'users_groups',
      columns: [
        {
          name: 'user',
          primary: false,
          unique: true,
          foreignKey: true,
          allowNull: false,
          dataType: {
            type: 'User',
            size: undefined,
            references: {
              name: 'user_id',
              table: 'users',
              column: 'id',
            },
          },
        },
        {
          name: 'group',
          primary: false,
          unique: false,
          foreignKey: true,
          allowNull: false,
          dataType: {
            type: 'Group',
            size: undefined,
            references: {
              name: 'group_id',
              table: 'groups',
              column: 'id',
            },
          },
        },
      ],
    },
  ],
  RAW_ENUM_DATA: {
    COLUMN_NAME: 'enum_fld',
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'enum',
    CHARACTER_MAXIMUM_LENGTH: '3',
    COLUMN_KEY: '',
    COLUMN_TYPE: "enum('No', 'Yes')",
  },
};
