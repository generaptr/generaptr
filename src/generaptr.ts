import * as chalk from 'chalk';
import * as figlet from 'figlet';
import * as inquirer from 'inquirer';
import logger from './commons/logger';
import generaptrTrack from './tracks/generaptr';

process.stdout.write('\x1Bc');

console.log(
  chalk.cyan(
    figlet.textSync('generaptr', {horizontalLayout: 'full'}),
  ),
);

logger.info('session initialized');
logger.info('generatig folder structure');
inquirer.prompt(generaptrTrack.questions)
  .then(generaptrTrack.handler)
  .catch((exception: Error) => {
    console.log(chalk.red(exception.message));
  });
