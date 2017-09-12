import utils from '../../../commons/utils/utils';
import typeUtil from '../../../commons/utils/typeUtil';
import { ConnectionData, SequleizeConfig, Schema, Table, Column, DataType } from '../../../commons/types';

/**
 * Class which implements the logic for generating valid sequelize files.
 *
 * @export
 * @class SequelizeModelGenerator
 */
export default class SequelizeModelGenerator {

  /**
   * Returns the string version of the code which will manage the sequelzie models.
   *
   * @returns {string} - sequelize models registry
   * @memberof SequelizeModelGenerator
   */
  public getModelsRegistry(): string {
    return `'use strict';
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
`;
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
        uri: 'mysql://user:password@host:port/database',
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

  /**
   * Generate models for a given schema.
   *
   * @param {Schema} schema - api schema
   * @return {{name: string, content: string}[]}
   */
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

  /**
   * Generate contents for each model based on the table schema.
   *
   * @param {Table} table - source
   * @return {string} content of sequelize model as string.
   */
  private getModelForTable(table: Table): string {
    return `module.exports = (sequelize, DataTypes) => {
  const ${utils.toTitleCase(table.name)} = sequelize.define('${utils.singular(table.name).toLowerCase()}', {
${this.getBasicDataTypes(table)}
  }, {
    tableName: '${table.name}',
    timestamps: false,
    underscored: true,
  });
  ${utils.toTitleCase(table.name)}.associate = (models) => {
${this.getRelations(table)}
  }
  return ${utils.toTitleCase(table.name)};
};`;
  }

  /**
   * Generate contents for the basic data types.
   * @param {Table} table - source
   * @return {string} generated content.
   */
  private getBasicDataTypes(table: Table): string {
    let dataTypes: string = '';
    table.columns.forEach((column: Column) => {
      if (!typeUtil.isDefaultType(column.dataType.type)) {
        return;
      }
      dataTypes += `    ${column.name}: {
      type: ${this.getType(column.dataType)},
      allowNull: ${column.allowNull ? 'true' : 'false'},
      unique: ${column.unique ? 'true' : 'false'},
      primaryKey: ${column.primary ? 'true' : 'false'},
      ${column.primary && column.dataType.type === 'number' ? 'autoIncrement: true,' : ''}
    },\n`;
    });

    return dataTypes;

  }

  /**
   * Returns the string version of the sequelize type.
   * @param {DataType} type source
   * @return {string} sequelize type
   */
  private getType(type: DataType): string {
    switch (type.type) {
      case 'string':
        return 'DataTypes.STRING()';
      case 'number':
        return 'DataTypes.INTEGER()';
      case 'enum':
        return `DataTypes.ENUM(${typeUtil.getEnumValuesAsString(type)})`;
      /* istanbul ignore next */
      default:
        return '';
    }
  }

  /**
   * Generate association methods for types.
   * @param {Table} table source
   * @return {string} - generated content
   */
  private getRelations(table: Table): string {
    const modelName: string = utils.toTitleCase(table.name);

    return table.columns.filter((column: Column) => !typeUtil.isDefaultType(column.dataType.type)).map((column: Column) => {
      switch (column.dataType.relationType) {
        case '1-1': {
          if (column.dataType.isRelationHolder) {
            return `    ${modelName}.hasOne(models.${column.dataType.type.toLowerCase()});`;
          } else {
            return `    ${modelName}.belongsTo(models.${column.dataType.type.toLowerCase()});`;
          }
        }
        case '1-n': {
          if (column.dataType.isRelationHolder) {
            return `    ${modelName}.hasMany(models.${column.dataType.type.toLowerCase()});`;
          } else {
            return `    ${modelName}.belongsTo(models.${column.dataType.type.toLowerCase()});`;
          }
        }
        case 'n-n': {
          if (modelName.localeCompare(column.dataType.type) > 0) {
            return `    ${modelName}.belongsToMany(models.${column.dataType.type.toLowerCase()}, {through: '${utils.pluralize(modelName).toLowerCase()}_${utils.pluralize(column.dataType.type).toLowerCase()}'});`;
          } else {
            return `    ${modelName}.belongsToMany(models.${column.dataType.type.toLowerCase()}, {through: '${utils.pluralize(column.dataType.type).toLowerCase()}_${utils.pluralize(modelName).toLowerCase()}'});`;
          }
        }
        default:
          return '';
      }
    }).join('\n');
  }
}
