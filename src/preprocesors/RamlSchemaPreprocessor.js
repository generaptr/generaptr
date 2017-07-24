const typeConverter = require('../commons/utils/typeConverter');

module.exports = class RamlSchemaPreprocessor {

  /**
   * Normalize the table schema.
   *
   * @param {*} columnSchema column schema to be normalized
   * @returns {{}} normalized column schema
   */
  convertToStandardSchema(columnSchema) {
    return {
      name: columnSchema.name,
      primary: columnSchema.name === 'id',
      unique: columnSchema.name === 'id',
      allowNull: !columnSchema.required,
      dataType: typeConverter.convertRamlTypes({
        type: columnSchema.type.pop(),
        items: columnSchema.items,
      }),
    };
  }
};
