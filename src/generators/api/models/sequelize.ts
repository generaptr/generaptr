import { ConnectionData, SequleizeConfig } from '../../../commons/types';

/**
 * Class which implements the logic for generating valid sequelize files.
 *
 * @export
 * @class SequelizeModelGenerator
 */
export class SequelizeModelGenerator {

  /**
   * Returns the string version of the code which will manage the sequelzie models.
   *
   * @returns {string} - sequelize models registry
   * @memberof SequelizeModelGenerator
   */
  public getModelsRegistry(): string {
    return `'use strict';
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '../config')['database'];
var db        = {};
if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
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
module.exports = db;`;
  }

  /**
   * Returns the sequelize config
   *
   * @param {ConnectionData} connection - connection data
   * @returns {string} - connection string
   * @memberof SequelizeModelGenerator
   */
  public getConfig(connection: ConnectionData): string {
    const config: SequleizeConfig = {
      database: {
        uri: `${connection.dialect.toLowerCase()}://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`,
        username: connection.user,
        password: connection.password,
        database: connection.database,
        host: connection.host,
        dialect: connection.dialect.toLowerCase(),
        port: connection.port,
      },
    };

    return `module.exports = ${JSON.stringify(config, undefined, 2)}`;
  }
}

export default new SequelizeModelGenerator();
