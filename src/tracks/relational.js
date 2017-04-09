const inquirer = require('inquirer');
const chalk = require('chalk');
const logger = require('../commons/logger');
const mysql = require('./relational/mysql');

exports.questions = [
  {
    name: 'databaseEngine',
    type: 'list',
    message: 'Database engine:',
    choices: ['MySql', 'Postgresql', 'Sqlite'],
    default: ['Mysql'],
  },
];

exports.handler = (data) => {
  switch (data.databaseEngine) {
    case 'MySql': {
      return inquirer.prompt(mysql.questions).then(mysql.handler);
    }
    default: {
      logger.warn(`${data.databaseEngine} not yet supported.`);
      console.log(chalk.yellow(`${data.databaseEngine} not yet supported.`));
    }

      return Promise.reject();
  }
};
