const logger = require('../commons/logger');
const chalk = require('chalk');
const relational = require('./relational');
const inquirer = require('inquirer');

exports.questions = [
  {
    name: 'databaseType',
    type: 'list',
    message: 'Choose database type',
    choices: ['relational', 'non-relational'],
    default: ['relational'],
  },
];

exports.handler = (data) => {
  switch (data.databaseType) {
    case 'relational':
      return inquirer.prompt(relational.questions).then(relational.handler);
    default: {
      logger.warn('Non-relational databases not supported yet.');
      console.log(chalk.yellow('Non-relational databases not supported yet.'));
      return Promise.reject();
    }
  }
};
