const logger = require('../configs/logger');

module.exports = class BaseValidator {

  trigger(error) {
    logger.error(error);
    throw new Error(error);
  }
};
