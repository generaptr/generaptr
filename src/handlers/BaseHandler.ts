import MysqlSchemaPreprocessor from '../preprocesors/MysqlSchemaPreprocessor';
import RamlSchemaPreprocessor from '../preprocesors/RamlSchemaPreprocessor';
import { RamlColumnSchema, MySqlColumnSchema, Column, Schema } from '../commons/types';

/**
 * Base Handler.
 *
 * @export
 * @class BaseHandler
 */
export default class BaseHandler {

  /**
   * Holds the driver name.
   *
   * @private
   * @type {string}
   * @memberof BaseHandler
   */
  private driver: string;

  public constructor(driver: string) {
    this.driver = driver;
  }

  /**
   * Normalize column schema.
   *
   * @param {*} columnSchema sql column schema
   * @returns {*} normalized column schema
   */
  public normalizeColumnSchema(columnSchema: RamlColumnSchema | MySqlColumnSchema): Column {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).convertToStandardSchema(columnSchema as MySqlColumnSchema);
      }
      case 'raml': {
        return (new RamlSchemaPreprocessor()).convertToStandardSchema(columnSchema as RamlColumnSchema);
      }
      default: {
        throw new Error('Input source not not supported.');
      }
    }
  }

  /**
   * Normalize relations between tables inside the schema.
   *
   * @param {*} schema database schema
   * @returns {*} normalized database schema
   */
  public normalizeRelations(schema: Schema): Schema {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).normalizeSchemaRelations(schema);
      }
      default: {
        throw new Error('Input source not not supported.');
      }
    }
  }
}
