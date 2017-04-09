const logger = require('../commons/logger');
const chalk = require('chalk');
const inquirer = require('inquirer');

const databaseTypeTrack = require('./databaseType');
const FileService = require('../fileOperations/fileService');

exports.questions = [
    {
        name: 'output',
        type: 'input',
        message: 'Raml output directory:',
        default: 'raml',
    }
];

exports.handler = (data) => {
    let fileService = new FileService(data.output);
    let schemaInfo;

    fileService.createDirectoryStructure()
        .then(() => {
            return inquirer.prompt(databaseTypeTrack.questions).then(databaseTypeTrack.handler);
        })
        .then(schema => {
            // get reference of current schema information
            schemaInfo = schema;

            return fileService.generateTypeFiles(schemaInfo);
        })
        .then(() => {
            console.log(chalk.green('Type files created'));

            return fileService.generateTypeExampleFiles(schemaInfo);
        })
        .then(() => {
            return fileService.generateTypeExamplesFiles();
        })
        .then(() => {
            console.log(chalk.green('Example type files created'));
            return Promise.resolve();
        })
        .catch(exception => {
            logger.error(exception);
            return Promise.reject(exception);
        })
};