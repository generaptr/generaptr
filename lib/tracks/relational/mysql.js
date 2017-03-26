const chalk = require('chalk');
module.exports = [
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
    }
  },
  {
    name: 'user',
    type: 'input',
    message: 'User (needs read access to information_schema):',
    default: 'root'
  },
  {
    name: 'password',
    type: 'password',
    message: 'Password:',
    default: ''
  },
];