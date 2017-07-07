/**
 * Application configurations
 * @type {{DEFAULT_DEPTH_LEVEL: number}}
 */
module.exports = {
  /**
   * Default depth level used by recursive function for generating type example
   */
  INITIAL_DEPTH_LEVEL: 0,
  DEFAULT_MAX_DEPTH_LEVEL: 2,
  DEFAULT_ARRAY_LENGTH: 2,
  DEPTH_INCREMENT: 1,
  ENV: process.env.NODE_ENV || 'development',
  CONNECTION_INFO: {
    MYSQL: {
      development: {
        host: '192.168.99.100',
        port: 3306,
        user: 'root',
        password: 'secret',
        database: 'test'
      },
      test: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        database: 'test'
      },
    },
  },
};
