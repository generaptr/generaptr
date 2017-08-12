import typeConverter from '../commons/utils/typeConverter';
import { RamlColumnSchema, Column, Schema } from '../commons/types';

/**
 * Raml schema pre processor.
 *
 * @export
 * @class RamlSchemaPreprocessor
 */
export default class RamlSchemaPreprocessor {

  /**
   * Normalize the table schema.
   *
   * @param {RamlColumnSchema} columnSchema column schema to be normalized
   * @returns {Column} normalized column schema
   */
  public convertToStandardSchema(columnSchema: RamlColumnSchema): Column {
    return {
      name: columnSchema.name,
      primary: columnSchema.name === 'id',
      unique: columnSchema.name === 'id',
      allowNull: !columnSchema.required,
      dataType: typeConverter.convertRamlTypes({
        type: columnSchema.type.pop() || '',
        items: columnSchema.items,
      }),
    };
  }

  /**
   * Normalize schema relations.
   *
   * @param {Schema} schema - schema which needs to be normalized
   * @returns {Schema} normalized schema
   */
  public normalizeSchemaRelations(schema: Schema): Schema {
    return schema;
  }
}
