const mysql = require('mysql');
const parser = require('../utils/parse');

class MysqlHandler {
  constructor(options) {
    this.options = options;
    this.connection = mysql.createConnection({
      host: this.options.host,
      port: this.options.port,
      user: this.options.username,
      password: this.options.password,
      database: 'information_schema',
    });
  }

  connect() {
    this.connection.connect();
  }

  readSchema() {
    console.log(`SELECT TABLE_NAME FROM TABLES WHERE TABLE_SCHEMA = ${this.options.database};`);
    this.connection.query(`SELECT TABLE_NAME FROM TABLES WHERE TABLE_SCHEMA = ${this.options.database};`, (err, results, fields) => {
      if (err) {
        throw new Error(err);
      }
      console.log(results, fields);
    })
  }
}

module.exports = MysqlHandler;