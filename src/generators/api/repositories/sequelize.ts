import utils from '../../../commons/utils/utils';
import schemaUtils from '../../../commons/utils/schemaUtil';
import { Schema, Table, Column } from '../../../commons/types';

/**
 * Class which implements the logic for generating valid sequelize repositories.
 *
 * @export
 */
export default class SequelizeRepositoryGenerator {

  /**
   * Generate repositories for a given schema.
   *
   * @param  schema - api schema
   */
  public getRepositories(schema: Schema): { name: string; content: string }[] {
    const repositories: { name: string; content: string }[] = [];
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
   * @param  table - schema for table
   */
  public getRepositoryForTable(table: Table): string {
    const related: { names: string[]; includes: string[] } = this.getRelatedEntities(table);
    const entity: string = utils.toTitleCase(table.name);

    return `const ${entity} = require('../models').${entity.toLowerCase()};
${related.names.map((name: string) => `const ${name} = require('../models').${name.toLowerCase()};`).join('\n')}

class ${entity}Repository {
  async get(id) {
    return ${entity}.findOne({where: {id}, include: [${related.includes.join(', ')}]});
  }

  async getAll(offset, limit) {
    return ${entity}.findAll({limit, offset, include: [${related.includes.join(', ')}]});
  }

  async save(data) {
    const created = await ${entity}.create(data);
    return created.id;
  }

  async update(id, data) {
    const exists = ${entity}.findOne({where: {id}});
    if (exists) {
      return ${entity}.update(data, {where: {id}});
    }
  }

  async delete(id) {
    return ${entity}.destroy({where: {id}});
  }

  async exists(id) {
    return Boolean(await ${entity}.count({where: {id}}));
  }

  async count() {
    return ${entity}.count();
  }
}

module.exports = new ${entity}Repository();
`;
  }

  /**
   * Generate repositories factory.
   *
   * @param  schema - api schema
   */
  public getRepositoryFactory(schema: Schema): { name: string; content: string } {
    const models: string[] = schema.map((table: Table) => utils.toTitleCase(table.name));

    return {
      name: 'repositoryFactory.js',
      content: `${models.map((name: string) => `const ${name.toLowerCase()}Repository = require('./${name}Repository');`).join('\n')}

class RepositoryFactory {
  getRepositoryForModel(model) {
    switch(model) {
${models.map((name: string) => `      case '${name}':
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

  /**
   * Format related entities.
   */
  protected getRelatedEntities(table: Table): { names: string[]; includes: string[] } {
    const relations: Column[] = schemaUtils.getRelatedTablesForTable(table);

    return {
      names: relations.map((column: Column) => utils.toTitleCase(column.dataType.type)).filter((item: string, index: number, array: string[]) => index === array.indexOf(item)),
      includes: relations.map((column: Column) => `{model: ${utils.toTitleCase(column.dataType.type)}, as: '${column.name}'}`).filter((item: string, index: number, array: string[]) => index === array.indexOf(item)),
    };
  }
}
