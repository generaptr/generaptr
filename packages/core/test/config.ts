export default {
  ENV: process.env.NODE_ENV || 'dev',

  /**
   * Connection default information
   */
  CONNECTION_INFO: {
    MYSQL: {
      dev: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'secret',
        database: 'test',
      },
      test: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'secret',
        database: 'test',
      },
    },
  },
};
