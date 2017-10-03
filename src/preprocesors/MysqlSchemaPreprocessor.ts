import typeUtil from '../commons/utils/typeUtil';
import utils from '../commons/utils/utils';
import schemaUtil from '../commons/utils/schemaUtil';
import logger from '../commons/logger';
import config from '../configs/config';
import { Schema, Table, Column, MySqlColumnSchema } from '../commons/types';

const CROSS_REFERENCE_COL_LENGTH: number = 2;
const FIRST_INDEX: number = 0;
const SECOND_INDEX: number = 1;

/**
 * MySql schema pre processor.
 *
 * @export
 * @class MysqlSchemaPreprocessor
 */
export default class MysqlSchemaPreprocessor {

  /**
   * Normalize the table schema.
   *
   * @param {*} columnSchema column schema to be normalized
   * @returns {{}} normalized column schema
   */
  public convertToStandardSchema(columnSchema: MySqlColumnSchema): Column {
    const column: Column = {
      name: columnSchema.COLUMN_NAME ? columnSchema.COLUMN_NAME : '',
      primary: Boolean(columnSchema.COLUMN_KEY && columnSchema.COLUMN_KEY === 'PRI'),
      unique: Boolean(
        columnSchema.COLUMN_KEY && (columnSchema.COLUMN_KEY === 'PRI' || columnSchema.COLUMN_KEY === 'UNI'),
      ),
      foreignKey: Boolean(columnSchema.COLUMN_KEY && columnSchema.COLUMN_KEY === 'MUL'),
      allowNull: Boolean(columnSchema.IS_NULLABLE && columnSchema.IS_NULLABLE === 'YES'),
      dataType: {
        type: typeUtil.convertSqlType(columnSchema.DATA_TYPE),
        size: columnSchema.CHARACTER_MAXIMUM_LENGTH ?
          parseInt(columnSchema.CHARACTER_MAXIMUM_LENGTH, config.NUMERIC_BASE) :
          undefined,
        rawValues: columnSchema.COLUMN_TYPE,
      },
    };

    return schemaUtil.convertValues(column);
  }

  /**
   * Normalizes all foreign key relations, by creating the respective columns in the target tables.
   *
   * @param {*} schema db schema
   * @returns {*} normalized db schema
   */
  public normalizeSchemaRelations(schema: Schema): Schema {
    let normalizedSchema: Schema = schema;
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
  private normalizeOneToOneRelations(schema: Schema): Schema {
    let updatedSchema: Schema = schema;
    schema.forEach((table: Table) => {
      if (!this.tableHasForeignKeys(table) || this.tableIsCrossReferenceTable(table)) {
        return table;
      }
      table.columns.forEach((column: Column) => {
        if (column.foreignKey && column.unique && column.dataType.references) {
          const targetColumn: Column = {
            name: schemaUtil.relationIsAlias(column) ? utils.toColumnName(column.dataType.references.name) : column.name,
            primary: column.primary,
            unique: true,
            allowNull: false,
            dataType: {
              type: column.dataType.type,
              isArray: false,
              relationType: '1-1',
            },
          };
          const sourceColumn: Column = {
            name: utils.singular(table.name).toLowerCase(),
            primary: column.primary,
            unique: true,
            allowNull: true,
            dataType: {
              type: utils.toTitleCase(table.name),
              isArray: false,
              relationType: '1-1',
              isRelationHolder: true,
            },
          };
          updatedSchema = this.addColumnToTable(
            updatedSchema,
            column.dataType.references.table,
            sourceColumn,
          );
          updatedSchema = this.addColumnToTable(
            updatedSchema,
            table.name,
            targetColumn,
          );
        }
      });

      return table;
    });

    return updatedSchema;
  }

  /**
   * Normalizes one to many relations.
   * Parses the table list and checks for tables
   * which have foreign keys, are not CrossReferenceTables(many to many)
   * and adds the foreign column on the holder.
   *
   * @param {Schema} schema db schema
   * @returns {Schema} normalized db schema
   */
  private normalizeOneToManyRelations(schema: Schema): Schema {
    let updatedSchema: Schema = schema;
    schema.forEach((table: Table) => {
      if (!this.tableHasForeignKeys(table) || this.tableIsCrossReferenceTable(table)) {
        return table;
      }
      table.columns.forEach((column: Column) => {
        if (column.foreignKey && column.dataType.references) {
          const sourceColumn: Column = {
            name: schemaUtil.relationIsAlias(column) ? utils.toColumnName(column.dataType.references.name) : column.name,
            primary: column.primary,
            unique: false,
            allowNull: false,
            dataType: {
              type: utils.toTitleCase(column.name),
              isArray: false,
              relationType: '1-n',
            },
          };
          const targetColumn: Column = {
            name: schemaUtil.relationIsAlias(column) ? `${table.name}_${utils.toColumnName(column.dataType.references.name)}` : table.name,
            primary: column.primary,
            unique: false,
            allowNull: true,
            dataType: {
              type: utils.toTitleCase(table.name),
              isArray: true,
              relationType: '1-n',
              isRelationHolder: true,
            },
          };
          updatedSchema = this.addColumnToTable(
            updatedSchema,
            column.dataType.references.table,
            targetColumn,
          );
          updatedSchema = this.addColumnToTable(
            updatedSchema,
            table.name,
            sourceColumn,
          );
          if (schemaUtil.relationIsAlias(column)) {
            updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, column.name);
          }
        }
      });

      return table;
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
  private normalizeManyToManyRelations(schema: Schema): Schema {
    let updatedSchema: Schema = schema;
    schema.forEach((table: Table) => {
      if (!this.tableIsCrossReferenceTable(table) || table.columns.length !== CROSS_REFERENCE_COL_LENGTH) {
        return table;
      }
      const source: Column = table.columns[FIRST_INDEX];
      const target: Column = table.columns[SECOND_INDEX];

      const sourceColumn: Column = {
        name: source.dataType.references ? source.dataType.references.table : '',
        primary: source.primary,
        unique: false,
        allowNull: true,
        dataType: {
          type: utils.toTitleCase(source.dataType.type),
          isArray: true,
          relationType: 'n-n',
          isRelationHolder: true,
        },
      };

      const targetColumn: Column = {
        name: target.dataType.references ? target.dataType.references.table : '',
        primary: target.primary,
        unique: false,
        allowNull: true,
        dataType: {
          type: utils.toTitleCase(target.dataType.type),
          isArray: true,
          relationType: 'n-n',
          isRelationHolder: true,
        },
      };

      updatedSchema = this.addColumnToTable(
        updatedSchema,
        source.dataType.references ? source.dataType.references.table : '',
        targetColumn,
      );
      updatedSchema = this.addColumnToTable(
        updatedSchema,
        target.dataType.references ? target.dataType.references.table : '',
        sourceColumn,
      );
      updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, source.name);
      updatedSchema = this.removeColumnFromTable(updatedSchema, table.name, target.name);

      return table;
    });

    return updatedSchema;
  }

  /**
   * Strips tables with no columns from schema.
   *
   * @param {*} schema db schema
   * @returns {Array<*>} cleaned up schema
   */
  private stripEmptyTables(schema: Schema): Schema {
    return schema.filter((table: Table) => Boolean(Object.keys(table.columns).length));
  }

  /**
   * Checks if the table has any foreign key columns.
   *
   * @param {*} table db table
   * @returns {boolean} checked if it contains foreign keys.
   */
  private tableHasForeignKeys(table: Table): boolean {
    return Boolean(table.columns.filter((column: Column) => column.foreignKey).length);
  }

  /**
   * Checks if the table is a cross reference map(association table for many to many relations).
   *
   * @param {*} table table schema
   * @returns {boolean} checked if cross reference table.
   */
  private tableIsCrossReferenceTable(table: Table): boolean {
    return table.columns.filter((column: Column) => column.foreignKey).length === table.columns.length;
  }

  /**
   * Adds a column to a table in the schema.
   *
   * @param {*} schema db schema
   * @param {string} tableName table in which to add column
   * @param {*} column column to be added
   * @returns {Array|*} updated schema
   */
  private addColumnToTable(schema: Schema, tableName: string, column: Column): Schema {
    return this.removeColumnFromTable(schema, tableName, column.name).map((table: Table) => {
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
  private removeColumnFromTable(schema: Schema, tableName: string, columnName: string): Schema {
    return schema.map((table: Table) => {
      if (table.name !== tableName) {
        return table;
      }
      table.columns = table.columns.filter((column: Column) => column.name !== columnName);

      return table;
    });
  }

  /**
   * Remove unused properties from schema.
   *
   * @param {*} schema db schema
   * @returns {Array|*} cleaned up db schema
   */
  private cleanupUnusedPropertiesFromColumns(schema: Schema): Schema {
    return schema.map((table: Table) => {
      table.columns.map((column: Column) => {
        delete column.foreignKey;

        return column;
      });

      return table;
    });
  }

}
