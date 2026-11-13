const chalk = require('chalk');
const inquirer = require('inquirer');
const { api: Api } = require('generaptr').operations;
const input = require('../inputs/input');
const dialect = require('./database/dialect');

module.exports.questions = [
  {
    name: 'output',
    type: 'input',
    message: 'Boilerplate API output directory:',
    default: 'api',
  },
  {
    name: 'name',
    type: 'input',
    message: 'Application name (lower case with dashes):',
  },
  {
    name: 'description',
    type: 'input',
    message: 'Application description:',
  },
  {
    name: 'version',
    type: 'input',
    message: 'Version:',
    default: '1.0.0',
  },
  {
    name: 'license',
    type: 'input',
    message: 'Licence:',
    default: 'ISC',
  },
  {
    name: 'author',
    type: 'input',
    message: 'Author:',
  },
];

module.exports.handler = async (data) => {
  const api = new Api(data.output);

  await api.createDirectoryStructure();

  const schema = await input.handler(await inquirer.prompt(input.questions));
  const connection = await dialect.handler(await inquirer.prompt(dialect.questions));
  const consent = await inquirer.prompt([{
    name: 'allow',
    type: 'confirm',
    message: chalk.yellow('Allow generaptr to install required packages:'),
  }]);

  if (!consent.allow) {
    throw new Error('User did not agree that generaptr should install required packages');
  }

  await api.createPackageJson(data, connection.dialect);
  await api.installDependencies(connection.dialect);
  await api.initializeORM(connection.dialect);
  await api.initializeConfig(connection, schema);
  await api.initializeCommons();
  await api.initializeModels(connection.dialect, schema);
  await api.initializeRepositories(connection.dialect, schema);
  await api.initializeServices(schema);
  await api.initializeControllers(schema);

  return true;
};
