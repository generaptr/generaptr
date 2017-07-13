const env = require('get-env')({
  test: ['test'],
});
/**
 * Application configurations
 * @type {{INITIAL_DEPTH_LEVEL: number, DEFAULT_MAX_DEPTH_LEVEL: number, DEFAULT_ARRAY_LENGTH: number, DEPTH_INCREMENT: number}}
 */
module.exports = {
  /**
   * Default depth level used by recursive function for generating type example
   */
  INITIAL_DEPTH_LEVEL: 0,
  /**
   * Default max depth level used for generating fake json data
   */
  DEFAULT_MAX_DEPTH_LEVEL: 2,
  /**
   * Default number of sub documents generated for a schema table
   */
  DEFAULT_ARRAY_LENGTH: 2,

  /**
   * Depth increment value
   */
  DEPTH_INCREMENT: 1,

  /**
   * Default end line terminator
   */
  END_OF_LINE: '\n',

  /**
   * Default indentation used for generating ram content
   */
  DEFAULT_INDENTATION: '  ',

  ENV: env,

  /**
   * Connection default information
   */
  CONNECTION_INFO: {
    MYSQL: {
      dev: {
        host: '192.168.99.100',
        port: 3306,
        user: 'root',
        password: 'secret',
        database: 'test',
      },
      test: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        database: 'test',
      },
    },
  },
};
