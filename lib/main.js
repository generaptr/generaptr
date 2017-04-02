(() => {

    const pkg = require('../package.json');
    const chalk = require('chalk');
    const clear = require('clear');
    const CLI = require('clui');
    const figlet = require('figlet');
    const inquirer = require('inquirer');
    const Preferences = require('preferences');
    const Spinner = CLI.Spinner;

    const relational = require('./tracks/relational');
    const FileService = require('../src/services/fileService');

    clear();
    console.log(
        chalk.cyan(
            figlet.textSync('generaptr', {horizontalLayout: 'full'})
        )
    );

    const outputQuestion = [
        {
            name: 'output',
            type: 'input',
            message: 'Raml output directory:',
            default: 'raml',
        }
    ];

    const questions = [
        {
            name: 'databaseType',
            type: 'list',
            message: 'Database type:',
            choices: ['relational', 'non-relational'],
            default: ['relational'],
        }
    ];

    inquirer.prompt(outputQuestion).then(data => {
        let fileService = new FileService(data.output);

        fileService.createDirectoryStructure()
            .then(() => {
                return inquirer.prompt(questions);
            })
            .then(data => {
                if (data.databaseType === 'non-relational') {
                    return console.log(chalk.red('Non-relational databases not supported yet.'));
                }
                return relational();
            })
            .then(schema => {
                console.log(schema);
            }).catch(err => console.log(chalk.red(err)));
    });
}).call(this);