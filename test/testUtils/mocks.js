module.exports = {
  PROCESSED_SCHEMA_ONE_TABLE: [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "firstName",
          "primary": false,
          "unique": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "lastName",
          "primary": false,
          "unique": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "email",
          "primary": false,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 50
          }
        }
      ]
    }
  ],
  PROCESSED_SCHEMA_ONE_TO_ONE: [
    {
      "name": "accounts",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "type",
          "primary": false,
          "unique": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
      ]
    },
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "firstName",
          "primary": false,
          "unique": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "lastName",
          "primary": false,
          "unique": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "email",
          "primary": false,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 50
          }
        },
        {
          "name": "account",
          "unique": true,
          "allowNull": false,
          "primary": false,
          "dataType": {
            "type": "Account",
            "isArray": false
          }
        },
      ]
    }
  ],
  PROCESSED_SCHEMA_MANY_TO_ONE: [
    {
      "name": "accounts",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "type",
          "primary": false,
          "unique": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "applications",
          "primary": false,
          "unique": false,
          "allowNull": true,
          "dataType": {
            "type": "Application",
            "isArray": true
          }
        }
      ]
    },
    {
      "name": "applications",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "name",
          "primary": false,
          "unique": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        }
      ]
    }
  ],
  PROCESSED_SCHEMA_MANY_TO_MANY: [
    {
      "name": "groups",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "name",
          "primary": false,
          "unique": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "users",
          "primary": false,
          "unique": false,
          "allowNull": true,
          "dataType": {
            "type": "User",
            "isArray": true
          }
        }
      ]
    },
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "firstName",
          "primary": false,
          "unique": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "lastName",
          "primary": false,
          "unique": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "email",
          "primary": false,
          "unique": true,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 50
          }
        },
        {
          "name": "groups",
          "primary": false,
          "unique": false,
          "allowNull": true,
          "dataType": {
            "type": "Group",
            "isArray": false
          }
        }
      ]
    }
  ],
  SCHEMA_ONE_TABLE: [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "firstName",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "lastName",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "email",
          "primary": false,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 50
          }
        }
      ]
    }],
  SCHEMA_ONE_TO_ONE: [
    {
      "name": "accounts",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "type",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "user",
          "primary": false,
          "unique": true,
          "foreignKey": true,
          "allowNull": false,
          "dataType": {
            "type": "User",
            "size": null,
            "references": {
              "name": "user_id",
              "table": "users",
              "column": "id"
            }
          }
        }
      ]
    },
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "firstName",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "lastName",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "email",
          "primary": false,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 50
          }
        }
      ]
    }
  ],
  SCHEMA_MANY_TO_ONE: [
    {
      "name": "accounts",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "type",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
      ]
    },
    {
      "name": "applications",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "name",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "account",
          "primary": false,
          "unique": false,
          "foreignKey": true,
          "allowNull": false,
          "dataType": {
            "type": "Account",
            "size": null,
            "references": {
              "name": "account_id",
              "table": "accounts",
              "column": "id"
            }
          }
        }
      ]
    }
  ],
  SCHEMA_MANY_TO_MANY: [
    {
      "name": "groups",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "name",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        }
      ]
    },
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "primary": true,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "number",
            "size": null
          }
        },
        {
          "name": "firstName",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "lastName",
          "primary": false,
          "unique": false,
          "foreignKey": false,
          "allowNull": true,
          "dataType": {
            "type": "string",
            "size": 255
          }
        },
        {
          "name": "email",
          "primary": false,
          "unique": true,
          "foreignKey": false,
          "allowNull": false,
          "dataType": {
            "type": "string",
            "size": 50
          }
        }
      ]
    },
    {
      "name": "users_groups",
      "columns": [
        {
          "name": "user",
          "primary": false,
          "unique": true,
          "foreignKey": true,
          "allowNull": false,
          "dataType": {
            "type": "User",
            "size": null,
            "references": {
              "name": "user_id",
              "table": "users",
              "column": "id"
            }
          }
        },
        {
          "name": "group",
          "primary": false,
          "unique": false,
          "foreignKey": true,
          "allowNull": false,
          "dataType": {
            "type": "Group",
            "size": null,
            "references": {
              "name": "group_id",
              "table": "groups",
              "column": "id"
            }
          }
        }
      ]
    }
  ],
};