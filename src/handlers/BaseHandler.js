const MysqlSchemaPreprocessor = require('../preprocesors/MysqlSchemaPreprocessor');
const RamlSchemaPreprocessor = require('../preprocesors/RamlSchemaPreprocessor');

module.exports = class BaseHandler {

  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Normalize column schema.
   *
   * @param {*} columnSchema sql column schema
   * @returns {*} normalized column schema
   */
  normalizeColumnSchema(columnSchema) {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).convertToStandardSchema(columnSchema);
      }
      case 'raml': {
        return (new RamlSchemaPreprocessor()).convertToStandardSchema(columnSchema);
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
  normalizeRelations(schema) {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).normalizeSchemaRelations(schema);
      }
      default: {
        throw new Error('Input source not not supported.');
      }
    }
  }
};
