const logger = require('../../commons/logger');
const chalk = require('chalk');
const databaseType = require('./database/databaseType');
const raml = require('./raml/raml');
const inquirer = require('inquirer');

exports.questions = [
  {
    name: 'input',
    type: 'list',
    message: 'Choose input source',
    choices: ['database', 'raml'],
    default: ['database'],
  },
];

exports.handler = (data) => {
  switch (data.input) {
    case 'database':
      return inquirer.prompt(databaseType.questions).then(databaseType.handler);
    case 'raml':
      return inquirer.prompt(raml.questions).then(raml.handler);
    default: {
      logger.warn('Input source not supported yet.');
      console.log(chalk.yellow('Input source not supported yet.'));
      return Promise.reject();
    }
  }
};
