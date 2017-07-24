const logger = require('../../commons/logger');
const chalk = require('chalk');
const inquirer = require('inquirer');

const input = require('../inputs/input');
const ApiFileOperations = require('../../fileOperations/ApiFileOperations');

exports.questions = [
  {
    name: 'output',
    type: 'input',
    message: 'Api output directory:',
    default: 'api',
  },
];

exports.handler = (data) => {
  let apiFileOperations = new ApiFileOperations(data.output);

  return apiFileOperations.createDirectoryStructure()
    .then(() => {
      logger.info('reading input source');
      return inquirer.prompt(input.questions).then(input.handler);
    })
    .then(schema => {
      logger.info(schema);
      logger.info('generating api');
      console.log(chalk.green('Api spec has been created.'));
      return Promise.resolve();
    })
    .catch(exception => {
      logger.error(exception.message);
      return Promise.reject(exception);
    });
};
