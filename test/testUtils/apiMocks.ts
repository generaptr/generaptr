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
    dialect: 'MySql',
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
  VALID_STATUS_CODES_CONSTANTS: `module.exports = {
  "OK": 200,
  "CREATED": 201,
  "NO_CONTENT": 204,
  "FOUND": 302,
  "SEE_OTHER": 303,
  "BAD_REQUEST": 400,
  "UNAUTHORIZED": 401,
  "FORBIDDEN": 403,
  "NOT_FOUND": 404,
  "METHOD_NOT_ALLOWED": 405,
  "CONFLICT": 409,
  "INTERNAL_SERVER_ERROR": 500,
  "BAD_GATEWAY": 502
};`,
  VALID_UTIL_CLASS: `module.exports = generateLocationUri = (request, id) => request.protocol + '://' + request.get('host') + request.originalUrl + '/' + id;`,
  VALID_APP_ERROR_CLASS: `module.exports = class AppError extends Error {

  constructor(message, status = 400, type, data) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = status;
    this.type = type;
    this.data = data;
  }

};`,
  VALID_CONFIG_VALUE: `module.exports = {
  development: {
    morgan: 'dev',
    APP_PORT: process.env.PORT || 3000
  },
  production: {
    morgan: 'combined',
    APP_PORT: process.env.PORT || 3000
  }
};`,
  VALID_CONFIG_GET_ENV_BASED_CONFIG: `const config = require('./config');

module.exports = {
  getEnvBasedConfig: () => {
    return (config[process.env.NODE_ENV] || config['development']);
  }
};`,
  VALID_CORS_CONFIG: `module.exports = (request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
};`,
  VALID_INDEX_FILE: `const express = require('express');
const AppError = require('./commons/AppError');
const profile = require('./configs/index.js').getEnvBasedConfig();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('../middlewares/cors');
const router = require('./configs/router.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan(profile.morgan));
app.use(cors);

app.use((error, req, res, next) => {
  if (error) {
    const response = {
    success: false,
    message: error.message || 'Something went wrong. Please try again later',
  };
  if (error instanceof AppError) {
    response.type = error.type;
    response.data = error.data || [];
  }

  res.status(error.status || 500).json(response);
  } else {
    next();
  }
});

app.use('/', router);

app.listen(profile.APP_PORT, () => {
  console.log('App started on port: ' + profile.APP_PORT);
});`,
  VALID_ROUTER_CONFIG: `const router = require('express').Router();

const defaultController = require('../controllers/defaultController');
const userController = require('../controllers/userController');

router.use('/', defaultController);
router.use('/users', userController);

module.exports = router;`,
  VALID_SERVICE_ONE_MODEL: `const repositoryFactory = require('../repositories/repositoryFactory');
const AppError = require('../commons/AppError');
const STATUS_CODE = require('../commons/constants/statusCode');

class UserService {
  constructor() {
    this.repository = repositoryFactory.getRepositoryForModel('User');
  }

  async save(data) {
    try {
      return this.repository.save(data);
    catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    try {
      const data = await this.repository.get(id);
      if (!data) {
        throw new AppError('No User found with id ' + id}, STATUS_CODE.NOT_FOUND);
      }

      return data;
    catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll(offset = 0, limit = 15) {
    try {
      const result = {
        meta: {
          offset: offset,
          limit: limit,
          count: 0
        },
        data: []
      };

      const data = await this.repository.getAll(Number(offset), Number(limit));
      const count = await this.repository.count();

      result.data = data;
      result.meta.count = count;
    } catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try{
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new AppError('No User found with id: ' + id, STATUS_CODE.NOT_FOUND);
      }
      return this.repository.delete(id);
    } catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id, data) {
    try {
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new AppError('No User found with id: ' + id, STATUS_CODE.NOT_FOUND);
      }
      return this.repository.update(id, data);
    } catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new UserService();`,
  VALID_DEFAULT_CONTROLLER: `const defaultRoute = require('express').Router();

defaultRoute.get('/', (request, response, next) => {
  response.json({ message: 'Hello from Generaptr' });
});

module.exports = defaultRoute;`,
  VALID_CONTROLLER_ONE_MODEL: `const router = require('express').Router();
const userService = require('../services/userService');
const { generateLocationUri } = require('../commons/util');
const STATUS_CODE = require('../commons/constants/statusCode');

router.get('/', async (request, response, next) => {
  try {
    const data = await userService.getAll(request.query.offset, request.query.limit);
    if (!data || data.length === 0) {
      response
        .status(STATUS_CODE.NO_CONTENT)
        .json({success: true});
    } else {
      response
        .status(STATUS_CODE.OK)
        .json({success: true, data});
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const id = await userService.save(request.body);
    response
      .header('Location', generateLocationUri(request, id))
      .status(STATUS_CODE.CREATED)
      .json({success: true});
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const data = await userService.get(request.params.id);
    response
      .status(STATUS_CODE.OK)
      .json({success: true, data});
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    await userService.delete(request.params.id)
    response
      .status(STATUS_CODE.NO_CONTENT)
      .json({success: true});
  } catch(error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const data = await userService.update(request.params.id, request.body);
    response
      .status(STATUS_CODE.OK)
      .json({success: true, data});
  } catch(error) {
    next(error);
  }
});

module.exports = router;`,
};
