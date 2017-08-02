const chalk = require('chalk');
const MysqlHandler = require('../../../../handlers/MysqlHandler');

exports.questions = [
  {
    name: 'host',
    type: 'input',
    message: 'Host:',
    default: '127.0.0.1',
  },
  {
    name: 'port',
    type: 'input',
    message: 'Port:',
    default: '3306',
    validate: (value) => {
      if (!isNaN(parseInt(value))) {
        return true;
      }

      return chalk.red('Port must be a number');
    },
  },
  {
    name: 'database',
    type: 'input',
    message: 'Database:',
    validate: (value) => {
      if (value.length) {
        return true;
      }

      return chalk.red('Database not provided');
    },
  },
  {
    name: 'user',
    type: 'input',
    message: 'User (needs read access to information_schema):',
    default: 'root',
  },
  {
    name: 'password',
    type: 'password',
    message: 'Password:',
    default: '',
  },
];

exports.handler = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const handler = new MysqlHandler(data);
      handler.connect();
      handler.readSchema().then(schema => {
        resolve(schema);
        handler.close();
      }).catch(err => reject(err));
    } catch (e) {
      reject(e);
    }
  });
};
