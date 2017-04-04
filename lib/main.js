(() => {
    const chalk = require('chalk');
    const clear = require('clear');
    const figlet = require('figlet');
    const inquirer = require('inquirer');
    const logger = require('../src/commons/logger');
    // const outputTrack = require('../src/tracks/output');
    const databaseType = require('../src/tracks/databaseType');
    clear();

    console.log(
        chalk.cyan(
            figlet.textSync('generaptr', {horizontalLayout: 'full'})
        )
    );

    logger.info(`session initialized`);

    inquirer.prompt(databaseType.questions)
      .then(databaseType.handler)
      .then(schema => {
          console.log('schema');
      })
      .catch(err => {
          console.log(chalk.red(err));
      });
    // inquirer.prompt(outputTrack.questions)
    //     .then(outputTrack.handler)
    //     .catch(exception => {
    //         console.log(chalk.red(exception));
    //     })

}).call(this);
