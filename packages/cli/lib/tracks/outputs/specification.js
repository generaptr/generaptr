const chalk = require('chalk');
const inquirer = require('inquirer');
const { raml: RAML } = require('generaptr').operations;
const type = require('../inputs/database/type');

module.exports.questions = [
  {
    name: 'output',
    type: 'input',
    message: 'RAML specification output directory:',
    default: 'raml',
  },
  {
    name: 'name',
    type: 'input',
    message: 'Application name:',
  },
  {
    name: 'version',
    type: 'input',
    message: 'Version:',
  },
  {
    name: 'url',
    type: 'input',
    message: 'Base URL:',
  },
];

module.exports.handler = async (data) => {
  const raml = new RAML(data.output);

  const schemaInfo = await type.handler(await inquirer.prompt(type.questions));

  await raml.generateSchemaTypeFiles(schemaInfo);
  await raml.generateSchemaTypeFiles(schemaInfo);
  await raml.generateSchemaExampleFiles(schemaInfo);
  await raml.generateSchemaExamplesFilesFromCache();
  await raml.generateSchemaApiFiles(schemaInfo, data);

  console.log(chalk.green(`RAML Specification has been generated in: ${data.output}`));

  return true;
};
