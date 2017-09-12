export default {
  PACKAGE_JSON_CONFIG: {
    name: 'demo-app',
    version: '1.0.0',
    description: 'Demo App generated with generaptr',
    author: 'Darius Cupsa',
    license: 'MIT',
    output: '',
  },
  VALID_PACKAGE_JSON: {
    name: 'demo-app',
    version: '1.0.0',
    description: 'Demo App generated with generaptr',
    main: 'index.js',
    scripts: {
      'test': `echo 'Error: no test specified' && exit 1`,
      'start': 'node src/index.js',
      'start:dev': './node_modules/.bin/nodemon src/index.js',
      'db:migrate': './node_modules/.bin/sequelize db:migrate --env development --config ./src/configs/database.js',
      'db:create-migration': './node_modules/.bin/sequelize migration:create --env development --config ./src/configs/database.js',
    },
    author: 'Darius Cupsa',
    license: 'MIT',
    dependencies: {},
  },
  VALID_SEQUELIZE_MODEL_REGISTRY: `'use strict';
const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(module.filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require(__dirname + '/../configs/database')[env];
const db        = {};
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });
Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
`,
  VALID_SEQUELIZE_CONFIG: {
    user: 'root',
    password: 'secret',
    database: 'test',
    host: '127.0.0.1',
    dialect: 'mysql',
    port: '3306',
  },
  VALID_SEQUELIZE_DATABASE_CONFIG: `module.exports = {
  "development": {
    "uri": "mysql://root:secret@127.0.0.1:3306/test",
    "username": "root",
    "password": "secret",
    "database": "test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "port": "3306"
  },
  "production": {
    "uri": "mysql://user:password@host:port/database",
    "username": "user",
    "password": "password",
    "database": "database",
    "host": "host",
    "dialect": "mysql",
    "port": "port"
  }
}`,
};
