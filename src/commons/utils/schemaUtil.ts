import utils from './utils';
import { Schema, Table, Column } from '../types';

/**
 * Class which holds helper tools when working with schema.
 *
 * @export
 * @class SchemaUtil
 */
export class SchemaUtil {

  /**
   * Get normalized schema by type
   * @param {Schema} schema - collection of tables
   * @param {string} type - data type normalized (E.g: User, Account)
   * @return {Table} table from schema that matches type.
   */
  public getNormalizedTableByType(schema: Schema, type: string): Table | undefined {
    for (const table of schema) {
      /* istanbul ignore else */
      if (utils.toTitleCase(table.name) === type) {
        return table;
      }
    }

    return undefined;
  }

  /**
   * Convert values from COLUMN_TYPE column
   * @param {Column} column - schema.
   * @return {Column} converted column
   */
  public convertValues(column: Column): Column {
    const columnType: string = column.dataType.rawValues || '';

    switch (column.dataType.type) {
      case 'enum':
        column.dataType.values = columnType ?
        (columnType.substring(4).replace(/["'()]/g, '').replace(' ', '').split(',')) : [];
        break;
      default:
        delete column.dataType.rawValues;
    }

    return column;
  }

  /**
   * Convert array of values to raml values
   * @param {string[]} values - ['Yes', 'No']
   * @return {string} - 'Yes | No'
   */
  public valuesToRamlDataType(values: string[]): string {
    return (values && values.length > 0) ? values.join(' | ') : '';
  }

  /**
   * Checks if a circular reference exists between the source and target table.
   *
   * @param {Table} source - source table
   * @param {Column} column - column which references another table
   * @param {Schema} schema - whole schema
   * @return {boolean} true if a circular reference exists in the target table
   */
  public isCircularRelation(source: Table, column: Column, schema: Schema): boolean {
    const target: Table | undefined = schema.find((table: Table) => table.name === utils.toTableName(column.name));
    if (target) {
      return target.columns.some((col: Column) => utils.toTableName(col.name) === source.name);
    }

    return false;
  }

  /**
   * Get related table names for a given table.
   *
   * @param {Table} table - given table
   * @returns {string[]} - related tables
   */
  public getRelatedTablesForTable(table: Table): string[] {
    return table.columns.filter((column: Column) => column.dataType.relationType).map((column: Column) => column.dataType.type);
  }
}

export default new SchemaUtil();
