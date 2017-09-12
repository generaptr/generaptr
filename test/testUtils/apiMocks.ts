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
  VALID_UTIL_CLASS: `class Util {
  generateLocationUri(request, id) {
    return request.protocol + '://' + request.get('host') + request.originalUrl + '/' + id;
  }
}

module.exports = new Util();`,
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
  VALID_EXPRESS_CONFIG: `const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('../middlewares/cors');
const profile = require('./index.js').getEnvBasedConfig();

module.exports = (app) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(morgan(profile.morgan));
  app.use(cors);

  return app;
};`,
  VALID_INDEX_FILE: `const express = require('express');
const profile = require('./configs/index.js').getEnvBasedConfig();
const loadExpressConfig = require('./configs/express.js');
const router = require('./configs/router.js');

let app = express();
app = loadExpressConfig(app);

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
const STATUS_CODE = require('../commons/constants/statusCode');

class UserService {
  constructor() {
    this.repository = repositoryFactory.getRepositoryForModel('User');
  }

  save(data) {
    return new Promise((resolve, reject) => {
      this.repository.save(data)
        .then(id => {
          resolve(id);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
    });
  }

  get(id) {
    return new Promise((resolve, reject) => {
      this.repository.get(id)
        .then(data => {
          if (!data) {
            return reject({'status': STATUS_CODE.NOT_FOUND, 'message': 'No User found with id ' + id});
          }
          resolve(data);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
    });
  }

  getAll(offset = 0, limit = 15) {
     const result = {
      meta: {
        offset: offset,
        limit: limit,
        count: 0
      },
      data: []
     };

     return new Promise((resolve, reject) => {
      this.repository.getAll(Number(offset), Number(limit))
        .then(data => {
          result.data = data;

          return this.repository.count();
        })
        .then(count => {
          result.meta.count = count;

          resolve(result);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
     });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      this.repository.exists(id)
        .then(exists => {
          if (!exists) {
            return reject({'status': STATUS_CODE.NOT_FOUND, 'message': 'No User found with id: ' + id});
          }
          return this.repository.delete(id);
        })
        .then(affectedUser => {
          resolve(true);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      this.repository.exists(id)
        .then(exists => {
          if (!exists) {
            return reject({'status': STATUS_CODE.NOT_FOUND, 'message': 'No User found with id ' + id});
          }
          return this.repository.update(id, data);
        })
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
    });
  }
}

module.exports = new UserService();`,
  VALID_DEFAULT_CONTROLLER: `const defaultRoute = require('express').Router();

defaultRoute.get('/', (request, response, next) => {
  response.json({ message: 'Hello from Generaptr' });
});

module.exports = defaultRoute;`,
  VALID_CONTROLLER_ONE_MODEL: `const userRoute = require('express').Router();
const userService = require('../services/userService');
const Util = require('../commons/util');
const STATUS_CODE = require('../commons/constants/statusCode');

userRoute.post('/', (request, response) => {
  userService.save(request.body)
    .then(id => {
      response.header('Location', Util.generateLocationUri(request, id));
      response.status(STATUS_CODE.CREATED);
      response.end();
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

userRoute.get('/:id', (request, response) => {
  userService.get(request.params.id)
    .then(data => {
      response.status(STATUS_CODE.OK);
      response.json(data);
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

userRoute.delete('/:id', (request, response) => {
  userService.delete(request.params.id)
    .then(() => {
      response.status(STATUS_CODE.NO_CONTENT);
      response.end();
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

userRoute.put('/:id', (request, response) => {
  userService.update(request.params.id, request.body)
    .then(data => {
      response.status(STATUS_CODE.OK);
      response.json(data);
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

userRoute.get('/', (request, response) => {
  userService.getAll(request.query.offset, request.query.limit)
    .then(data => {
      if (!data || data.size === 0) {
        response.status(STATUS_CODE.NO_CONTENT);
        response.end();
      } else {
        response.status(STATUS_CODE.OK);
        response.json(data);
      }
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

module.exports = userRoute;`,
};
