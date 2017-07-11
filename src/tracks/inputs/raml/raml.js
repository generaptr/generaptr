const logger = require('../../../commons/logger');
const chalk = require('chalk');
const RamlHandler = require('../../../handlers/RamlHandler');
exports.questions = [
  {
    name: 'path',
    type: 'input',
    message: 'Path to raml spec file',
    validate: (value) => {
      if (value.length) {
        return true;
      }
      return chalk.red('Path to raml spec file not provided.');
    },
  },
];

exports.handler = (data) => {
  const handler = new RamlHandler(data);
  return handler.parseSchema();
};
