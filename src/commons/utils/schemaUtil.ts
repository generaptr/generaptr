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
        (columnType.replace(/["'()]/g, '').replace(' ', '').split(',')) : [];
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
}

export default new SchemaUtil();
