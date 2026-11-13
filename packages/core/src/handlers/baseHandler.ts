import MysqlSchemaPreprocessor from '../preprocesors/mysqlSchemaPreprocessor';
import RamlSchemaPreprocessor from '../preprocesors/ramlSchemaPreprocessor';
import { RamlColumnSchema, MySqlColumnSchema, Column, Schema } from '../commons/types';

/**
 * Base Handler.
 *
 * @export
 */
export default class BaseHandler {

  /**
   * Holds the driver name.
   *
   */
  private readonly driver: string;

  public constructor(driver: string) {
    this.driver = driver;
  }

  /**
   * Normalize column schema.
   *
   * @param  columnSchema sql column schema
   * @returns  normalized column schema
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
   * @param  schema database schema
   * @returns  normalized database schema
   */
  public normalizeRelations(schema: Schema): Schema {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).normalizeSchemaRelations(schema);
      }
      case 'raml': {
        return (new RamlSchemaPreprocessor()).normalizeSchemaRelations(schema);
      }
      default: {
        throw new Error('Input source not not supported.');
      }
    }
  }
}
