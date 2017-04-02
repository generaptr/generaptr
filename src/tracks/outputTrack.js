const logger = require('../commons/logger');
const chalk = require('chalk');
const inquirer = require('inquirer');

const databaseTypeTrack = require('./databaseType');
const FileService = require('../services/fileService');

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

    fileService.createDirectoryStructure()
        .then(() => {
            return inquirer.prompt(databaseTypeTrack.questions).then(databaseTypeTrack.handler);
        })
        .then(data => {
            return fileService.generateTypeFiles(data);
        })
        .then(() => {
            console.log(chalk.green('Type files created'));
            return Promise.resolve();
        })
        .catch(exception => {
            logger.error(exception);
            return Promise.reject(exception);
        })
};