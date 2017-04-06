const typeConverter = require('../utils/typeConverter');
const utils = require('../utils/utils');

module.exports = class MysqlSchemaPreprocessor {

  /**
   * @param tableSchema
   * @returns {{}}
   */
  convertToStandardTableSchema(tableSchema) {
    const schema = {};
    schema.name = tableSchema['COLUMN_NAME'] ? tableSchema['COLUMN_NAME'] : null;
    schema.primary = !!(tableSchema['COLUMN_KEY'] && tableSchema['COLUMN_KEY'] === 'PRI');
    schema.unique = !!(tableSchema['COLUMN_KEY'] && (tableSchema['COLUMN_KEY'] === 'PRI' || tableSchema['COLUMN_KEY'] === 'UNI'));
    schema.foreignKey = !!(tableSchema['COLUMN_KEY'] && tableSchema['COLUMN_KEY'] === 'MUL');
    schema.allowNull = !!(tableSchema['IS_NULLABLE'] && tableSchema['IS_NULLABLE'] === 'YES');
    schema.dataType = {
      type: typeConverter.convertType(tableSchema['DATA_TYPE']),
      size: tableSchema['CHARACTER_MAXIMUM_LENGTH'] ? parseInt(tableSchema['CHARACTER_MAXIMUM_LENGTH']) : null,
    };
    return schema;
  }

  convertToStandard(schema) {
    schema = this.normalizeOneToOneRelations(schema);
    schema = this.normalizeOneToManyRelations(schema);
    schema = this.normalizeManyToManyRelations(schema);
    schema = this.stripEmptyTables(schema);

    return schema;
  }

  normalizeOneToOneRelations(schema) {
    let updatedSchema = schema;
    schema.forEach(table => {
      if (!this.tableHasForeignKeys(table) || this.tableIsCrossReferenceTable(table)) {
        return table;
      }
      table.columns.forEach(column => {
        if (column.foreignKey && column.unique) {
          const targetColumn = {
            name: utils.singular(table.name),
            unique: true,
            allowNull: false,
            dataType: {
              type: utils.toTitleCase(table.name),
              isArray: false
            }
          };
          const sourceColumn = {
            name: column.name,
            primary: column.primary,
            unique: true,
            dataType: {
              type: column.dataType.type,
              isArray: false
            }
          };
          updatedSchema = this.addForeignColumnToTable(updatedSchema, column.dataType.references.table, targetColumn);
          updatedSchema = this.addForeignColumnToTable(updatedSchema, table.name, sourceColumn);
        }
      });
    });

    return updatedSchema;
  }

  normalizeOneToManyRelations(schema) {
    let updatedSchema = schema;
    schema.forEach(table => {
      if (!this.tableHasForeignKeys(table) || this.tableIsCrossReferenceTable(table)) {
        return table;
      }
      table.columns.forEach(column => {
        if (column.foreignKey) {
          const targetColumn = {
            name: table.name,
            primary: column.primary,
            unique: false,
            allowNull: true,
            dataType: {
              type: utils.toTitleCase(table.name),
              isArray: true
            }
          };
          updatedSchema = this.addForeignColumnToTable(updatedSchema, column.dataType.references.table, targetColumn);
          updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, column.name);
        }
      });
    });

    return updatedSchema;
  }
  normalizeManyToManyRelations(schema) {
    let updatedSchema = schema;
    schema.forEach(table => {
      if (!this.tableIsCrossReferenceTable(table) || table.columns.length !== 2) {
        return table;
      }
      const source = table.columns[0];
      const target = table.columns[1];

      const sourceColumn = {
        name: source.dataType.references.table,
        primary: source.primary,
        unique: false,
        allowNull: true,
        dataType: {
          type: utils.toTitleCase(source.dataType.type),
          isArray: true
        }
      };

      const targetColumn = {
        name: target.dataType.references.table,
        primary: target.primary,
        unique: false,
        allowNull: true,
        dataType: {
          type: utils.toTitleCase(target.dataType.type),
          isArray: true
        }
      };

      updatedSchema = this.addForeignColumnToTable(updatedSchema, source.dataType.references.table, targetColumn);
      updatedSchema = this.addForeignColumnToTable(updatedSchema, target.dataType.references.table, sourceColumn);
      updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, source.name);
      updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, target.name);

    });

    return updatedSchema;
  }

  stripEmptyTables(schema) {
    return schema.filter(table => !!Object.keys(table.columns).length);
  }

  tableHasForeignKeys(table) {
    return !!table.columns.filter(column => column.foreignKey).length;
  }

  tableIsCrossReferenceTable(table) {
    return table.columns.filter(column => column.foreignKey).length === table.columns.length;
  }

  addForeignColumnToTable(schema, tableName, column) {
    return this.removeColumnFromTable(schema, tableName, column.name).map(table => {
      if (table.name !== tableName) {
        return table;
      }
      table.columns.push(column);

      return table;
    });
  }

  removeColumnFromTable(schema, tableName, columnName) {
    return schema.map(table => {
      if (table.name !== tableName) {
        return table;
      }
      table.columns = table.columns.filter(column => {
        return column.name !== columnName;
      });

      return table;
    });
  }
};