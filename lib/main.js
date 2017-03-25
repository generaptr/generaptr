(() => {
  const program = require('commander');
  const colors = require('colors');
  const pkg = require('../package.json');
  const cli = require('./cli');

  program
    .version(pkg.version)
    .option('-t, --type     [type]', 'set the connection type, default is mysql')
    .option('-h, --host     [host]', 'IP address or host name of the database server, default 127.0.0.1')
    .option('    --port     [port]', 'Port of database server to connect')
    .option('-d, --database [database]', 'Database name')
    .option('-u, --user     [user]', 'Username to connect to database')
    .option('-p, --password [password]', 'Password to connect to database')
    .parse(process.argv);

  if (process.argv.length <= 2) {
    program.help();
  }

  try {
    const options = {};
    const type = program.type || 'mysql';

    ['host', 'port', 'database', 'user', 'password'].forEach((option) => {
      if (program[option] !== undefined) {
        options[option] = program[option];
      }
    });

    switch (type) {
      default:
        return cli.handleMysqlConnection(options).then(schema => console.log(schema)).catch(err => console.log(err));
    }

  } catch (_error) {
    console.log(`[ ${"generaptr".white} ] ${_error.toString().red}`);
  }
}).call(this);