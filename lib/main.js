(() => {
    const program = require('commander');
    const colors = require('colors');
    const pkg = require('../package.json');
    const cli = require('./cli');

    program
        .version(pkg.version)
        .option('-m, --message [message]', 'set message to be printed.')
        .parse(process.argv);

    if (process.argv.length > 2) {
        try {
            cli.print({
                message: program.message
            });
        } catch (_error) {
            console.log(`[ ${"generaptr".white} ],  ${_error.toString().red}`);
        }
    } else {
        program.help();
    }
}).call(this);