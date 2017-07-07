const logger = require('../configs/logger');
const config = require('../configs/config');

class Logger {
  /**
   * Log info message
   * @param {string} message - message to be logged
   */
  info(message) {
    if (config.ENV === 'dev' || config.ENV === 'test') {
      logger.info(message);
    }
  }
  /**
   * Log warn message
   * @param {string} message - message to be logged
   */
  warn(message) {
    if (config.ENV === 'dev' || config.ENV === 'test') {
      logger.warn(message);
    }
  }
  /**
   * Log error message
   * @param {string} message - message to be logged
   */
  error(message) {
    if (config.ENV === 'dev') {
      logger.error(message);
    }
  }

}

module.exports = new Logger();
