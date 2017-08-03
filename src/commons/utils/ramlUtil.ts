import * as faker from 'faker';
import utils from './utils';
import PROPERTIES_NAME from '../constants/propertiesName';
import { StringMapOfStrings } from '../types';

/**
 * Class which holds helper tools when working with ramls.
 *
 * @export
 * @class RamlUtil
 */
export class RamlUtil {

  /**
   * Generate fake data for a field name
   * @param {string} field - field name
   * @param {string} type - data raml type: can be number / string / Boolean / date etc
   * @param {?string[]} values - default values for attributes (eg. enum: 'Yes' | 'No')
   * @return {*} fake data
   */
  public generateFakeData(field: string, type: string, values?: string[]): string | number | boolean {
    if (values && values.length) {
      return values[Math.floor(Math.random() * values.length)];
    }
    for (const key of Object.keys(PROPERTIES_NAME)) {

      const index: number = utils.indexOfIgnoreCase((PROPERTIES_NAME as StringMapOfStrings)[key], field.toString());
      const firstPosition: number = 0;

      if (index >= firstPosition) {
        return this.parseRamlValue(faker[key][PROPERTIES_NAME[key][index]](), type);
      }

      if (key.toLowerCase() === field.toLowerCase()) {
        return this.parseRamlValue(faker[key][PROPERTIES_NAME[key][firstPosition]](), type);
      }
    }

    if (field === 'id' || field === '_id') {
      return this.generateId(type);
    }

    return this.parseRamlValue(faker.lorem.word(), type);
  }

  /**
   * Parse object value to a custom raml type
   * @param {*} value - value to be parsed
   * @param {string} type - raml type
   * @return {*} parsed value
   */
  protected parseRamlValue(value: string, type: string): number | string | boolean {
    const base: number = 10;
    switch (type) {
      case 'number':
        return parseInt(value, base);
      case 'string':
        return value.toString();
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  }

  /**
   * Generate id/_id field value
   * @param {string} type - can be number / string / boolean
   * @return {*} random id
   */
  protected generateId(type: string): number | string {
    switch (type) {
      case 'number':
        return faker.random.number(Number.MAX_SAFE_INTEGER);
      case 'string':
        return faker.random.uuid();
      default:
        throw new Error('Not implemented yet');
    }
  }
}

export default new RamlUtil();
