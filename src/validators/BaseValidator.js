const logger = require('../commons/logger');

module.exports = class BaseValidator {

  trigger(error) {
    logger.error(error);
    throw new Error(error);
  }
};
