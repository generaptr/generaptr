export default {
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

  TABS: {
    LEVEL_0: 0,
    LEVEL_1: 1,
    LEVEL_2: 2,
    LEVEL_3: 3,
    LEVEL_4: 4,
    LEVEL_5: 5,
    LEVEL_6: 6,
    LEVEL_7: 7,
    LEVEL_8: 8,
    LEVEL_9: 9,
  },

  NUMERIC_BASE: 10,

  DEFAULT_INDENTATION_SPACE_COUNT: 2,

  ENV: process.env.NODE_ENV || 'dev',

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
