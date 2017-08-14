import utils from '../../../commons/utils/utils';
import { ConnectionData, SequleizeConfig, Schema, Table, Column, DataType } from '../../../commons/types';

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
      development: {
        uri: `${connection.dialect.toLowerCase()}://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`,
        username: connection.user,
        password: connection.password,
        database: connection.database,
        host: connection.host,
        dialect: connection.dialect.toLowerCase(),
        port: connection.port,
      },
      production: {
        uri: 'mysq;://user:password@host:port/database',
        username: 'user',
        password: 'password',
        database: 'database',
        host: 'host',
        dialect: 'mysql',
        port: 'port',
      },
    };

    return `module.exports = ${JSON.stringify(config, undefined, 2)}`;
  }

  public getModels(schema: Schema): {name: string; content: string}[] {
    const models: {name: string; content: string}[] = [];
    schema.forEach((table: Table) => {
      models.push({
        name: `${utils.toTitleCase(table.name)}.js`,
        content: this.getModelForTable(table),
      });
    });

    return models;
  }

  private getModelForTable(table: Table): string {
    return `module.exports = (sequelize, DataTypes) => {
  const ${utils.toTitleCase(table.name)} = sequelize.define('${utils.singular(table.name).toLowerCase()}', {
${this.getBasicDataTypes(table)}
  }, {
    tableName: '${table.name}',
    timestamps: false,
    underscored: false,
    classMethods: {
      associate: (models) => {
      },
    },
  });

  return ${utils.toTitleCase(table.name)};
};`;
  }

  private getBasicDataTypes(table: Table): string {
    let dataTypes: string = '';
    table.columns.forEach((column: Column) => {
      dataTypes += `    ${column.name}: {
      type: ${this.getType(column.dataType)},
      allowNull: ${column.allowNull ? 'true' : 'false'},
      unique: ${column.unique ? 'true' : 'false'},
      primary: ${column.primary ? 'true' : 'false'}
    },\n`;
    });

    return dataTypes;

  }

  private getType(type: DataType): string {
    switch (type.type) {
      case 'string':
        return 'DataTypes.STRING()';
      case 'number':
        return 'DataTypes.INTEGER()';
      default:
        return '';
    }
  }
}

export default new SequelizeModelGenerator();
