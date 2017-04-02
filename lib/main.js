(() => {
  const chalk = require('chalk');
  const clear = require('clear');
  const figlet = require('figlet');
  const inquirer = require('inquirer');
  const logger = require('../src/commons/logger');
  const databaseTypeTrack = require('../src/tracks/databaseType');

  clear();

  console.log(
    chalk.cyan(
      figlet.textSync('generaptr', { horizontalLayout: 'full' })
    )
  );

  logger.info(`session initialized`);

  inquirer.prompt(databaseTypeTrack.questions)
    .then(databaseTypeTrack.handler)
    .catch(err => logger.error(err));

}).call(this);
