import typeConverter from '../commons/utils/typeConverter';
import { RamlColumnSchema, Column } from '../commons/types';

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
}
