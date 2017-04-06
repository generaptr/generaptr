(() => {
    const chalk = require('chalk');
    const clear = require('clear');
    const figlet = require('figlet');
    const inquirer = require('inquirer');
    const logger = require('../src/commons/logger');
    const outputTrack = require('../src/tracks/output');

    clear();

    console.log(
        chalk.cyan(
            figlet.textSync('generaptr', {horizontalLayout: 'full'})
        )
    );

    logger.info(`session initialized`);

    inquirer.prompt(outputTrack.questions)
        .then(outputTrack.handler)
        .catch(exception => {
            console.log(chalk.red(exception));
        });

}).call(this);
