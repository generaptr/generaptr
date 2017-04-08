const typeConverter = require('../utils/typeConverter');
const utils = require('../utils/utils');
const logger = require('../logger');

module.exports = class MysqlSchemaPreprocessor {

  /**
   * Normalize the table schema.
   *
   * @param tableSchema
   * @returns {{}}
   */
  convertToStandardSchema(tableSchema) {
    const schema = {};
    schema.name = tableSchema['COLUMN_NAME'] ? tableSchema['COLUMN_NAME'] : null;
    schema.primary = !!(tableSchema['COLUMN_KEY'] && tableSchema['COLUMN_KEY'] === 'PRI');
    schema.unique = !!(tableSchema['COLUMN_KEY'] && (tableSchema['COLUMN_KEY'] === 'PRI' || tableSchema['COLUMN_KEY'] === 'UNI'));
    schema.foreignKey = !!(tableSchema['COLUMN_KEY'] && tableSchema['COLUMN_KEY'] === 'MUL');
    schema.allowNull = !!(tableSchema['IS_NULLABLE'] && tableSchema['IS_NULLABLE'] === 'YES');
    schema.dataType = {
      type: typeConverter.convertSqlType(tableSchema['DATA_TYPE']),
      size: tableSchema['CHARACTER_MAXIMUM_LENGTH'] ? parseInt(tableSchema['CHARACTER_MAXIMUM_LENGTH']) : null,
    };
    return schema;
  }

  /**
   * Normalizes all foreign key relations, by creating the respective columns in the target tables.
   *
   * @param schema
   * @returns {*}
   */
  normalizeSchemaRelations(schema) {
    schema = this.sortSchema(schema);
    schema = this.normalizeOneToOneRelations(schema);
    schema = this.normalizeOneToManyRelations(schema);
    schema = this.normalizeManyToManyRelations(schema);
    schema = this.cleanupUnusedPropertiesFromColumns(schema);
    schema = this.stripEmptyTables(schema);
    logger.info(JSON.stringify(schema));
    console.log(JSON.stringify(schema));
    return schema;
  }

  /**
   * Normalizes one to one relations.
   * Parses the table list and checks for tables
   * which have unique foreign keys, are not CrossReferenceTables(many to many)
   * and adds the foreign column on both sides of the relation.
   *
   * @param schema
   * @returns {*}
   */
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
            primary: column.primary,
            unique: true,
            allowNull: false,
            dataType: {
              type: utils.toTitleCase(table.name),
              isArray: false
            }
          };

          updatedSchema = this.addColumnToTable(updatedSchema, column.dataType.references.table, targetColumn);
          updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, column.name);
        }
      });
    });

    return updatedSchema;
  }

  /**
   * Normalizes one to many relations.
   * Parses the table list and checks for tables
   * which have foreign keys, are not CrossReferenceTables(many to many)
   * and adds the foreign column on the holder.
   *
   * @param schema
   * @returns {*}
   */
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
          updatedSchema = this.addColumnToTable(updatedSchema, column.dataType.references.table, targetColumn);
          updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, column.name);
        }
      });
    });

    return updatedSchema;
  }

  /**
   * Normalizes many to many relations.
   * Parses the table list and checks for tables
   * which are CrossReferenceTables(many to many)
   * and adds the foreign columns to the source and target tables.
   *
   * @param schema
   * @returns {*}
   */
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

      updatedSchema = this.addColumnToTable(updatedSchema, source.dataType.references.table, targetColumn);
      updatedSchema = this.addColumnToTable(updatedSchema, target.dataType.references.table, sourceColumn);
      updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, source.name);
      updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, target.name);

    });

    return updatedSchema;
  }

  /**
   * Strips tables with no columns from schema.
   *
   * @param schema
   * @returns {Array<*>}
   */
  stripEmptyTables(schema) {
    return schema.filter(table => !!Object.keys(table.columns).length);
  }

  /**
   * Checks if the table has any foreign key columns.
   *
   * @param table
   * @returns {boolean}
   */
  tableHasForeignKeys(table) {
    return !!table.columns.filter(column => column.foreignKey).length;
  }

  /**
   * Checks if the table is a cross reference map(association table for many to many relations).
   *
   * @param table
   * @returns {boolean}
   */
  tableIsCrossReferenceTable(table) {
    return table.columns.filter(column => column.foreignKey).length === table.columns.length;
  }

  /**
   * Adds a column to a table in the schema.
   *
   * @param schema
   * @param tableName
   * @param column
   * @returns {Array|*}
   */
  addColumnToTable(schema, tableName, column) {
    return this.removeColumnFromTable(schema, tableName, column.name).map(table => {
      if (table.name !== tableName) {
        return table;
      }
      table.columns.push(column);

      return table;
    });
  }

  /**
   * Removes a column from a table in the schema.
   *
   * @param schema
   * @param tableName
   * @param columnName
   * @returns {Array|*}
   */
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

  /**
   * Remove unused properties from schema.
   *
   * @param schema
   * @returns {Array|*}
   */
  cleanupUnusedPropertiesFromColumns(schema) {
    return schema.map(table => {
      table.columns.map(column => {
        delete column.foreignKey;
        return column;
      });
      return table;
    });
  }

  /**
   * Sort schema so tables without foreign keys are first.
   *
   * @param schema
   * @returns {Array|*}
   */
  sortSchema(schema) {
    return schema.sort((a, b) => {
      return  Number(this.tableHasForeignKeys(b)) - Number(this.tableHasForeignKeys(a));
    });
  }
};
