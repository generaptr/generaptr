import utils from './utils';
import { DataType } from '../types';
/**
 * TypeCovertor util class.
 *
 * @export
 * @class TypeConverter
 */
export class TypeConverter {
  /**
   * Array that holds the number types
   *
   * @private
   * @type {string[]}
   * @memberof TypeConverter
   */
  private numberTypes: string[] = ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'decimal', 'float', 'double'];

  /**
   * Array that holds the string types
   *
   * @private
   * @type {string[]}
   * @memberof TypeConverter
   */
  private stringTypes: string[] = [
    'char', 'varchar', 'blob', 'text', 'tinyblob', 'tinytext', 'mediumblob', 'mediumtext', 'longblob', 'longtext',
  ];

  /**
   * Converts a given database type to the standard one.
   * @param {string} type db type.
   * @returns {string} standard type
   */
  public convertSqlType(type: string): string {
    if (utils.indexOfIgnoreCase(this.numberTypes, type.toLowerCase()) > -1 ||
      (type.toLowerCase() === 'timestamp') ||
      (type.toLowerCase() === 'year')) {
      return 'number';
    } else if (utils.indexOfIgnoreCase(this.stringTypes, type.toLowerCase()) > -1) {
      return 'string';
    } else if (type.toLowerCase() === 'date') {
      return 'date-only';
    } else if (type.toLowerCase() === 'datetime') {
      return 'datetime';
    } else if (type.toLowerCase() === 'time') {
      return 'time-only';
    } else if (type.toLowerCase() === 'enum') {
      return 'enum';
    }
    throw new Error('Type not found');
  }

  /**
   * Converts no sql types to standard schema
   * @param {string} type - type to be converted
   */
  public convertNoSqlType(type: string): void {
    throw new Error(`${type} not yet implemented.`);
  }

  /**
   * Converts raml types to standard schema
   * @param {{type: string; items: string}} type - type to be converted
   * @returns {{type: string; isArray: boolean; values?: string[]}} - converted type
   */
  public convertRamlTypes(type: {type: string; items: string}): DataType {
    if (type.type.indexOf('|') > -1) {
      return {
        type: 'enum',
        isArray: false,
        values: type.type.split(' | '),
      };
    } else if (type.type === 'array') {
      return {
        type: type.items,
        isArray: true,
      };
    }

    return {
      type: type.type,
      isArray: false,
    };
  }
}

export default new TypeConverter();
