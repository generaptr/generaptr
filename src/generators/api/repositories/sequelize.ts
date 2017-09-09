import utils from '../../../commons/utils/utils';
import schemaUtils from '../../../commons/utils/schemaUtil';
import { Schema, Table } from '../../../commons/types';

/**
 * Class which implements the logic for generating valid sequelize repositories.
 *
 * @export
 * @class SequelizeRepositoryGenerator
 */
export default class SequelizeRepositoryGenerator {

  /**
   * Generate repositories for a given schema.
   *
   * @param {Schema} schema - api schema
   * @return {{name: string, content: string}[]}
   */
  public getRepositories(schema: Schema): {name: string; content: string}[] {
    const repositories: {name: string; content: string}[] = [];
    schema.forEach((table: Table) => {
      repositories.push({
        name: `${utils.toTitleCase(table.name)}Repository.js`,
        content: this.getRepositoryForTable(table),
      });
    });

    return repositories;
  }
  /**
   * Generate repository for a given table.
   *
   * @param {Table} table - schema for table
   * @return {{name: string, content: string}}
   */
  public getRepositoryForTable(table: Table): string {
    const related: string[] = schemaUtils.getRelatedTablesForTable(table).map((name: string) => utils.toTitleCase(name));
    const entity: string = utils.toTitleCase(table.name);

    return `const ${entity} = require('../models').${entity};
${related.map((name: string) => `const ${name} = require('../models').${name};`).join('\n')}

class ${entity}Repository {
  get(id) {
    return ${entity}.findOne({where: {id}, includes: [${related.join(', ')}]});
  }

  getAll(offset, limit) {
    return ${entity}.findAll({limit, offset, includes: [${related.join(', ')}]});
  }

  save(data) {
    return ${entity}.create(data).then((created) => {
      return created.id;
    });
  }

  update(id, data) {
    return ${entity}.findOne({where: {id}}).then(
      (${entity}) => {
        return ${entity}.update(data, {where: {id}});
      }
    )
  }

  delete(id) {
    return ${entity}.destroy({where: {id}});
  }

  exists(id) {
    return ${entity}.count({where: {id}}).then((count) => Boolean(count));
  }

  count() {
    return ${entity}.count();
  }
}

module.exports = new ${entity}Repository();
`;
  }

  /**
   * Generate repositories factory.
   *
   * @param {Schema} schema - api schema
   * @return {{name: string, content: string}}
   */
  public getRepositoryFactory(schema: Schema): {name: string; content: string} {
    const models: string[] = schema.map((table: Table) => utils.toTableName(table.name));

    return {
      name: 'repositoryFactory.js',
      content: `${models.map((name: string) => `const ${name.toLowerCase()}Repository = require('./${name.toLowerCase()}Repository');`).join('\n')}

class RepositoryFactory {
  getRepositoryForModel(model) {
    switch(model) {
${models.map((name: string) => `      case ${name}:
        return ${name.toLowerCase()}Repository;`).join('\n')}
      default:
        throw new Error('Repository not implemented for this model');
    }
  }
}

module.exports = new RepositoryFactory();

`,
    };
  }
}
