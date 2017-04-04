const logger = require('../commons/logger');
const MysqlSchemaPreprocessor = require('../commons/preprocesors/MysqlSchemaPreprocessor');

module.exports = class BaseHandler {

  constructor(driver) {
    this.driver = driver;
  }

  normalizeTableSchema(tableSchema) {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).convertToStandardTableSchema(tableSchema);
      }
      default: {
        logger.warn('Database driver not supported.');
      }
    }
  }

  normalizeRelations(schema) {
    switch (this.driver) {
      case 'mysql': {
        return (new MysqlSchemaPreprocessor()).convertToStandard(schema);
      }
      default: {
        logger.warn('Database driver not supported.');
      }
    }
  }
};