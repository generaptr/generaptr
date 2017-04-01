(() => {
<<<<<<< HEAD
    const program = require('commander');
    const colors = require('colors');
    const pkg = require('../package.json');
    const cli = require('./cli');
    const FileService = require('../src/utils/fileService');

    program
        .version(pkg.version)
        .option('-t, --type     [type]', 'set the connection type, default is mysql')
        .option('-h, --host     [host]', 'IP address or host name of the database server')
        .option('    --port     [port]', 'Port of database server to connect')
        .option('-d, --database [database]', 'Database name')
        .option('-u, --user     [user]', 'Username to connect to database')
        .option('-p, --password [password]', 'Password to connect to database')
        .option('-o,  --output  [output]', 'Raml output dir')
        .parse(process.argv);

    if (process.argv.length <= 2) {
        program.help();
=======

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
>>>>>>> develop
    }
  ];

<<<<<<< HEAD
    try {
        const options = {};
        const type = program.type || 'mysql';

        ['host', 'port', 'database', 'user', 'password', 'output'].forEach((option) => {
            if (program[option] !== undefined) {
                options[option] = program[option];
            }
        });

        // switch (type) {
        //     default:
        //         return cli.handleMysqlConnection(options)
        // }

        const fileService = new FileService(options.output);

        fileService.checkOutputPath()
            .then(() => {
                console.log("It's there");
            })
            .catch(message => {
                console.log(message);
            })

    } catch (_error) {
        console.log(`[ ${"generaptr".white} ] ${_error.toString().red}`);
    }
=======
  inquirer.prompt(questions).then((data) => {
    if (data.databaseType === 'non-relational') {
      return console.log(chalk.red('Non-relational databases not supported yet.'));
    }
    relational().then(schema => {
      console.log(schema);
    }).catch(err => console.log(err));
  });
>>>>>>> develop
}).call(this);