(() => {
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
    }

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
}).call(this);