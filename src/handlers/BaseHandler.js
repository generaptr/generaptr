const logger = require('../commons/logger');
const MysqlSchemaPreprocessor = require('../commons/preprocesors/MysqlSchemaPreprocessor');

module.exports = class BaseHandler {

  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Normalize table schema.
   *
   * @param tableSchema
   * @returns {{}}
   */
  normalizeTableSchema(tableSchema) {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).convertToStandardSchema(tableSchema);
      }
      default: {
        logger.warn('Database driver not supported.');
      }
    }
  }

  /**
   * Normalize relations between tables inside the schema.
   *
   * @param schema
   * @returns {*}
   */
  normalizeRelations(schema) {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).normalizeSchemaRelations(schema);
      }
      default: {
        logger.warn('Database driver not supported.');
      }
    }
  }
};