import utils from './utils';
import { DataType } from '../types';
/**
 * TypeUtil util class.
 *
 * @export
 */
export class TypeUtil {
  /**
   * Array that holds the number types
   *
   */
  private readonly numberTypes: string[] = ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'decimal', 'float', 'double'];

  /**
   * Array that holds the string types
   *
   */
  private readonly stringTypes: string[] = [
    'char', 'varchar', 'blob', 'text', 'tinyblob', 'tinytext', 'mediumblob', 'mediumtext', 'longblob', 'longtext',
  ];

  /**
   * Converts a given database type to the standard one.
   * @param  type db type.
   * @returns  standard type
   */
  public convertSqlType(type: string): string {
    if (utils.indexOfIgnoreCase(this.numberTypes, type.toLowerCase()) > -1 ||
      (type.toLowerCase() === 'timestamp') ||
      (type.toLowerCase() === 'year')) {
      return 'number';
    }
    if (utils.indexOfIgnoreCase(this.stringTypes, type.toLowerCase()) > -1) {
      return 'string';
    }
    if (type.toLowerCase() === 'date') {
      return 'date-only';
    }
    if (type.toLowerCase() === 'datetime') {
      return 'datetime';
    }
    if (type.toLowerCase() === 'time') {
      return 'time-only';
    }
    if (type.toLowerCase() === 'enum') {
      return 'enum';
    }
    throw new Error('Type not found');
  }

  /**
   * Converts no sql types to standard schema
   * @param  type - type to be converted
   */
  public convertNoSqlType(type: string): void {
    throw new Error(`${type} not yet implemented.`);
  }

  /**
   * Converts raml types to standard schema
   * @param  type - type to be converted
   * @returns  - converted type
   */
  public convertRamlTypes(type: { type: string; items: string }): DataType {
    if (type.type.indexOf('|') > -1) {
      return {
        type: 'enum',
        isArray: false,
        values: type.type.split(' | '),
      };
    }
    if (type.type === 'array') {
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

  /**
   * Converts Enum values to string.
   *
   * @param  type source datatype
   * @return  enum values as string
   */
  public getEnumValuesAsString(type: DataType): string {
    if (type.type === 'enum' && type.values) {
      return type.values
        .map((value: string) => `'${value}'`)
        .join(', ');
    }

    return '';
  }

  /**
   * Checks if the provided type is a default one.
   *
   * @param  type - data type
   * @return  returns true if type is a default one.
   */
  public isDefaultType(type: string): boolean {
    return ['enum', 'number', 'string'].some((item: string) => type === item);
  }
}

export default new TypeUtil();
