const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('inquirer');
const action = require('./tracks/action');

clear();
console.log(
  chalk.cyan(
    figlet.textSync('generaptr', { horizontalLayout: 'full' }),
  ),
);

(async () => {
  try {
    const answers = await inquirer.prompt(action.questions);
    await action.handler(answers);
  } catch (error) {
    console.log(chalk.red(error.message));
  }
})();
