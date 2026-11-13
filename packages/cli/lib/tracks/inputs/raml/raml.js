const chalk = require('chalk');
const { handlers } = require('generaptr');

module.exports.questions = [
  {
    name: 'path',
    type: 'input',
    message: 'Path to the RAML specification: ',
    validate: (value) => {
      if (value.length) {
        return true;
      }
      console.log(chalk.red('Path to the RAML specification not provided.'));

      return false;
    },
  },
];

module.exports.handler = (data) => {
  const ramlHandler = new handlers.RAML(data);

  return ramlHandler.parseSchema();
};
