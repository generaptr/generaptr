(() => {
  const chalk = require('chalk');
  const clear = require('clear');
  const figlet = require('figlet');
  const inquirer = require('inquirer');
  const logger = require('../src/commons/logger');
  const generaptrTrack = require('../src/tracks/generaptr');

  clear();

  console.log(
    chalk.cyan(
      figlet.textSync('generaptr', {horizontalLayout: 'full'})
    )
  );

  logger.info('session initialized');
  logger.info('generatig folder structure');
  inquirer.prompt(generaptrTrack.questions)
    .then(generaptrTrack.handler)
    .catch(exception => {
      console.log(chalk.red(exception));
    });
}).call(this);
