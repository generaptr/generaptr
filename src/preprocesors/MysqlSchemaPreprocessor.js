const typeConverter = require('../commons/utils/typeConverter');
const utils = require('../commons/utils/utils');
const SchemaUtil = require('../commons/utils/schemaUtil');
const logger = require('../commons/logger');

const CROSS_REFERENCE_COL_LENGTH = 2;
const FIRST_INDEX = 0;
const SECOND_INDEX = 1;

module.exports = class MysqlSchemaPreprocessor {

  /**
   * Normalize the table schema.
   *
   * @param {*} columnSchema column schema to be normalized
   * @returns {{}} normalized column schema
   */
  convertToStandardSchema(columnSchema) {
    const schema = {};
    schema.name = columnSchema.COLUMN_NAME ? columnSchema.COLUMN_NAME : null;
    schema.primary = Boolean(columnSchema.COLUMN_KEY && columnSchema.COLUMN_KEY === 'PRI');
    schema.unique = Boolean(columnSchema.COLUMN_KEY && (columnSchema.COLUMN_KEY === 'PRI' || columnSchema.COLUMN_KEY === 'UNI'));
    schema.foreignKey = Boolean(columnSchema.COLUMN_KEY && columnSchema.COLUMN_KEY === 'MUL');
    schema.allowNull = Boolean(columnSchema.IS_NULLABLE && columnSchema.IS_NULLABLE === 'YES');
    schema.dataType = {
      type: typeConverter.convertSqlType(columnSchema.DATA_TYPE),
      size: columnSchema.CHARACTER_MAXIMUM_LENGTH ? parseInt(columnSchema.CHARACTER_MAXIMUM_LENGTH) : null,
      values: columnSchema.COLUMN_TYPE,
    };

    SchemaUtil.convertValues(schema);
    return schema;
  }

  /**
   * Normalizes all foreign key relations, by creating the respective columns in the target tables.
   *
   * @param {*} schema db schema
   * @returns {*} normalized db schema
   */
  normalizeSchemaRelations(schema) {
    let normalizedSchema = schema;
    normalizedSchema = this.normalizeOneToOneRelations(normalizedSchema);
    normalizedSchema = this.normalizeOneToManyRelations(normalizedSchema);
    normalizedSchema = this.normalizeManyToManyRelations(normalizedSchema);
    normalizedSchema = this.cleanupUnusedPropertiesFromColumns(normalizedSchema);
    normalizedSchema = this.stripEmptyTables(normalizedSchema);

    logger.info(JSON.stringify(normalizedSchema));
    return normalizedSchema;
  }

  /**
   * Normalizes one to one relations.
   * Parses the table list and checks for tables
   * which have unique foreign keys, are not CrossReferenceTables(many to many)
   * and adds the foreign column on both sides of the relation.
   *
   * @param {*} schema db schema
   * @returns {*} normalized db schema
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
              isArray: false,
            },
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
   * @param {*} schema db schema
   * @returns {*} normalized db schema
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
              isArray: true,
            },
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
   * @param {*} schema db schema
   * @returns {*} normalized db schema
   */
  normalizeManyToManyRelations(schema) {
    let updatedSchema = schema;
    schema.forEach(table => {
      if (!this.tableIsCrossReferenceTable(table) || table.columns.length !== CROSS_REFERENCE_COL_LENGTH) {
        return table;
      }
      const source = table.columns[FIRST_INDEX];
      const target = table.columns[SECOND_INDEX];

      const sourceColumn = {
        name: source.dataType.references.table,
        primary: source.primary,
        unique: false,
        allowNull: true,
        dataType: {
          type: utils.toTitleCase(source.dataType.type),
          isArray: true,
        },
      };

      const targetColumn = {
        name: target.dataType.references.table,
        primary: target.primary,
        unique: false,
        allowNull: true,
        dataType: {
          type: utils.toTitleCase(target.dataType.type),
          isArray: true,
        },
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
   * @param {*} schema db schema
   * @returns {Array<*>} cleaned up schema
   */
  stripEmptyTables(schema) {
    return schema.filter(table => Boolean(Object.keys(table.columns).length));
  }

  /**
   * Checks if the table has any foreign key columns.
   *
   * @param {*} table db table
   * @returns {boolean} checked if it contains foreign keys.
   */
  tableHasForeignKeys(table) {
    return Boolean(table.columns.filter(column => column.foreignKey).length);
  }

  /**
   * Checks if the table is a cross reference map(association table for many to many relations).
   *
   * @param {*} table table schema
   * @returns {boolean} checked if cross reference table.
   */
  tableIsCrossReferenceTable(table) {
    return table.columns.filter(column => column.foreignKey).length === table.columns.length;
  }

  /**
   * Adds a column to a table in the schema.
   *
   * @param {*} schema db schema
   * @param {string} tableName table in which to add column
   * @param {*} column column to be added
   * @returns {Array|*} updated schema
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
   * @param {*} schema db schema
   * @param {string} tableName table from which we need to remove
   * @param {string} columnName column to be removed
   * @returns {Array|*} schema with removed column
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
   * @param {*} schema db schema
   * @returns {Array|*} cleaned up db schema
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

};
