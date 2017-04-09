const logger = require('../commons/logger');
const MysqlSchemaPreprocessor = require('../commons/preprocesors/MysqlSchemaPreprocessor');

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
  normalizeTableSchema(columnSchema) {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).convertToStandardSchema(columnSchema);
      }
      default: {
        logger.warn('Database driver not supported.');
      }

        return false;
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
        logger.warn('Database driver not supported.');
      }

        return false;
    }
  }
};
