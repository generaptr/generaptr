const generaptr = require('./lib/generaptr');

const test = async () => {
  const handler = new generaptr.Handlers.MySql({
    host: 'localhost',
    user: 'root',
    password: 'secret',
    database: 'test'
  });
  

  const schema = await handler.getSchema();
  console.log(JSON.stringify(schema, undefined, 2));

  process.exit(0);
};

test();