import utils from '../../commons/utils/utils';
import config from '../../configs/config';
import { Schema, Table, RAMLApplicationInfo } from '../../commons/types';

/**
 * Class which holds the logic for generating raml spec.
 *
 * @export
 * @class SpecGenerator
 */
export class SpecGenerator {

  /**
   * Generates the api spec for the whole schema.
   *
   * @param {Schema} schema - entire collection of tables
   * @param {RAMLApplicationInfo} options - holds the title of the app, the version and the base url
   * @return {string} - returns the api spec
   */
  public generateContent(schema: Schema, options: RAMLApplicationInfo): string {
    let spec: string = this.addHeaderContent(options) + this.addDataTypes(schema);
    schema.forEach((entity: Table) => {
      spec += this.addSpecForEntity(entity);
    });

    return spec;
  }

  /**
   * Generates the header content
   *
   * @param {RAMLApplicationInfo} options - holds the title of the app, the version and the base url
   * @return {string} returns the formatted header
   */
  public addHeaderContent(options: RAMLApplicationInfo): string {
    return utils.formatLine('', config.TABS.LEVEL_0, '#%RAML 1.0') +
      utils.formatLine('', config.TABS.LEVEL_0, `title: ${options.name}`) +
      utils.formatLine('', config.TABS.LEVEL_0, `version: ${options.version}`) +
      utils.formatLine('', config.TABS.LEVEL_0, `baseUri: ${options.url}{version}`) +
      utils.formatLine('', config.TABS.LEVEL_0, 'protocols: [HTTP, HTTPS]');
  }

  /**
   * Adds the data types based on schema
   *
   * @param {Schema} schema - entire collection of tables
   * @return {string} returns the formatted data types
   */
  public addDataTypes(schema: Schema): string {
    let types: string = `types:${config.END_OF_LINE}`;

    schema.forEach((entity: Table) => {
      types += utils.formatLine(
        config.DEFAULT_INDENTATION,
        0,
        `${utils.toTitleCase(entity.name)}: !include types/${utils.toTitleCase(entity.name)}.raml`,
      );
    });

    return types;
  }

  /**
   * Generates the get all spec
   *
   * @param {Table} entity - holds the entity definition
   * @return {string} - returns the formatted spec for the entity
   */
  public addSpecForEntity(entity: Table): string {
    let spec: string = `/${entity.name}:${config.END_OF_LINE}`;
    spec += this.addGetAllSpec(config.DEFAULT_INDENTATION, entity);
    spec += this.addCreateSpec(config.DEFAULT_INDENTATION, entity);
    spec += utils.formatLine(config.DEFAULT_INDENTATION, config.TABS.LEVEL_0, `/{${utils.singular(entity.name)}Id}:`);
    spec += this.addGetOneSpec(config.DEFAULT_INDENTATION, entity);
    spec += this.addUpdateSpec(config.DEFAULT_INDENTATION, entity);
    spec += this.addDeleteSpec(config.DEFAULT_INDENTATION, entity);

    return spec;
  }

  /**
   * Generates the get all spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {Table} entity - holds the entity definition
   * @return {string} - returns the formatted get all spec
   */
  public addGetAllSpec(initialIndentation: string, entity: Table): string {
    return utils.formatLine(initialIndentation, config.TABS.LEVEL_0, 'get:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_1, `description: Get a list of all ${entity.name}`) +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_1, 'responses:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_2, '200:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_3, 'body:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_4, 'application/json:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_5, `type: ${utils.toTitleCase(entity.name)}[]`) +
      utils.formatLine(
        initialIndentation,
        config.TABS.LEVEL_5,
        `example: !include examples/${utils.pluralize(utils.toTitleCase(entity.name))}.json`,
      );
  }

  /**
   * Generates the create spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {Table} entity - holds the entity definition
   * @return {string} - returns the formatted create spec
   */
  public addCreateSpec(initialIndentation: string, entity: Table): string {
    return utils.formatLine(initialIndentation, config.TABS.LEVEL_0, 'post:') +
      utils.formatLine(
        initialIndentation,
        config.TABS.LEVEL_1,
        `description: Create a ${utils.singular(entity.name)}`) +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_1, 'body:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_2, 'application/json:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_3, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_1, 'responses:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_2, '201:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_3, 'body:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_4, 'application/json:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_5, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(
        initialIndentation,
        config.TABS.LEVEL_5,
        `example: !include examples/${utils.toTitleCase(entity.name)}.json`,
      );
  }

  /**
   * Generates the get one spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {Table} entity - holds the entity definition
   * @return {string} - returns the formatted get one spec
   */
  public addGetOneSpec(initialIndentation: string, entity: Table): string {
    return utils.formatLine(initialIndentation, config.TABS.LEVEL_1, 'get:') +
      utils.formatLine(
        initialIndentation,
        config.TABS.LEVEL_2,
        `description: Get an instance of ${utils.singular(entity.name)} based on it's id.`) +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_2, 'responses:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_3, '200:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_4, 'body:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_5, 'application/json:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_6, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(
        initialIndentation,
        config.TABS.LEVEL_6,
        `example: !include examples/${utils.toTitleCase(entity.name)}.json`,
      );
  }

  /**
   * Generates the update spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {Table} entity - holds the entity definition
   * @return {string} - returns the formatted update spec
   */
  public addUpdateSpec(initialIndentation: string, entity: Table): string {
    return utils.formatLine(initialIndentation, config.TABS.LEVEL_1, 'put:') +
      utils.formatLine(
        initialIndentation,
        config.TABS.LEVEL_2,
        `description: Update an instance of ${utils.singular(entity.name)}.`) +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_2, 'body:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_3, 'application/json:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_4, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_2, 'responses:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_3, '200:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_4, 'body:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_5, 'application/json:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_6, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(
        initialIndentation,
        config.TABS.LEVEL_6,
        `example: !include examples/${utils.toTitleCase(entity.name)}.json`,
      );
  }

  /**
   * Generates the delete spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {Table} entity - holds the entity definition
   * @return {string} - returns the formatted delete spec
   */
  public addDeleteSpec(initialIndentation: string, entity: Table): string {
    return utils.formatLine(initialIndentation, config.TABS.LEVEL_1, 'delete:') +
      utils.formatLine(
        initialIndentation,
        config.TABS.LEVEL_2,
        `description: Delete an instance of ${utils.singular(entity.name)} based on it's id.`) +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_2, 'responses:') +
      utils.formatLine(initialIndentation, config.TABS.LEVEL_3, '204:');
  }
}

export default new SpecGenerator();
