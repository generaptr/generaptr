(() => {

  const pkg = require('../package.json');
  const chalk       = require('chalk');
  const clear       = require('clear');
  const CLI         = require('clui');
  const figlet      = require('figlet');
  const inquirer    = require('inquirer');
  const Preferences = require('preferences');
  const Spinner     = CLI.Spinner;

  const relational = require('./tracks/relational');

  clear();
  console.log(
    chalk.cyan(
      figlet.textSync('generaptr', { horizontalLayout: 'full' })
    )
  );

  const questions = [
    {
      name: 'databaseType',
      type: 'list',
      message: 'Database type:',
      choices: ['relational', 'non-relational'],
      default: ['relational'],
    }
  ];

  inquirer.prompt(questions).then((data) => {
    if (data.databaseType === 'non-relational') {
      return console.log(chalk.red('Non-relational databases not supported yet.'));
    }
    relational().then(schema => {
      console.log(schema);
    }).catch(err => console.log(err));
  });
}).call(this);