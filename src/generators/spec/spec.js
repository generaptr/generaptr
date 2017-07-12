const utils = require('../../commons/utils/utils');
const config = require('../../configs/config');

class SpecGenerator {

  /**
   * Generates the api spec for the whole schema.
   *
   * @param {*} schema - entire collection of tables
   * @param {*} options - holds the title of the app, the version and the base url
   * @return {*} - returns the api spec
   */
  generateContent(schema, options) {
    let spec = this.addHeaderContent(options) + this.addDataTypes(schema);
    schema.forEach(entity => {
      spec += this.addSpecForEntity(entity);
    });

    return spec;
  }

  /**
   * Generates the header content
   *
   * @param {*} options - holds the title of the app, the version and the base url
   * @return {string} returns the formatted header
   */
  addHeaderContent(options) {
    return utils.formatLine('', 0, '#%RAML 1.0') +
      utils.formatLine('', 0, `title: ${options.name}`) +
      utils.formatLine('', 0, `version: ${options.version}`) +
      utils.formatLine('', 0, `baseUri: ${options.url}{version}`) +
      utils.formatLine('', 0, 'protocols: [HTTP, HTTPS]');
  }

  /**
   * Adds the data types based on schema
   *
   * @param {*} schema - entire collection of tables
   * @return {string} returns the formatted data types
   */
  addDataTypes(schema) {
    let types = `types:${config.END_OF_LINE}`;

    schema.forEach(entity => {
      types += utils.formatLine(
        config.DEFAULT_INDENTATION,
        0,
        `${utils.toTitleCase(entity.name)}: !include types/${utils.toTitleCase(entity.name)}.raml`
      );
    });

    return types;
  }

  /**
   * Generates the get all spec
   *
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted spec for the entity
   */
  addSpecForEntity(entity) {
    let spec = `/${entity.name}:${config.END_OF_LINE}`;
    spec += this.addGetAllSpec(config.DEFAULT_INDENTATION, entity);
    spec += this.addCreateSpec(config.DEFAULT_INDENTATION, entity);
    spec += utils.formatLine(config.DEFAULT_INDENTATION, 0, `/{${utils.singular(entity.name)}Id}:`);
    spec += this.addGetOneSpec(config.DEFAULT_INDENTATION, entity);
    spec += this.addUpdateSpec(config.DEFAULT_INDENTATION, entity);
    spec += this.addDeleteSpec(config.DEFAULT_INDENTATION, entity);

    return spec;
  }

  /**
   * Generates the get all spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted get all spec
   */
  addGetAllSpec(initialIndentation, entity) {
    return utils.formatLine(initialIndentation, 0, 'get:') +
      utils.formatLine(initialIndentation, 1, `description: Get a list of all ${entity.name}`) +
      utils.formatLine(initialIndentation, 1, 'responses:') +
      utils.formatLine(initialIndentation, 2, '200:') +
      utils.formatLine(initialIndentation, 3, 'body:') +
      utils.formatLine(initialIndentation, 4, 'application/json:') +
      utils.formatLine(initialIndentation, 5, `type: ${utils.toTitleCase(entity.name)}[]`) +
      utils.formatLine(initialIndentation, 5, `example: !include examples/${utils.pluralize(utils.toTitleCase(entity.name))}.json`);
  }

  /**
   * Generates the create spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted create spec
   */
  addCreateSpec(initialIndentation, entity) {
    return utils.formatLine(initialIndentation, 0, 'post:') +
      utils.formatLine(initialIndentation, 1, `description: Create a ${utils.singular(entity.name)}`) +
      utils.formatLine(initialIndentation, 1, 'body:') +
      utils.formatLine(initialIndentation, 2, 'application/json:') +
      utils.formatLine(initialIndentation, 3, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(initialIndentation, 1, 'responses:') +
      utils.formatLine(initialIndentation, 2, '201:') +
      utils.formatLine(initialIndentation, 3, 'body:') +
      utils.formatLine(initialIndentation, 4, 'application/json:') +
      utils.formatLine(initialIndentation, 5, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(initialIndentation, 5, `example: !include examples/${utils.toTitleCase(entity.name)}.json`);
  }

  /**
   * Generates the get one spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted get one spec
   */
  addGetOneSpec(initialIndentation, entity) {
    return utils.formatLine(initialIndentation, 1, 'get:') +
      utils.formatLine(initialIndentation, 2, `description: Get an instance of ${utils.singular(entity.name)} based on it's id.`) +
      utils.formatLine(initialIndentation, 2, 'responses:') +
      utils.formatLine(initialIndentation, 3, '200:') +
      utils.formatLine(initialIndentation, 4, 'body:') +
      utils.formatLine(initialIndentation, 5, 'application/json:') +
      utils.formatLine(initialIndentation, 6, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(initialIndentation, 6, `example: !include examples/${utils.toTitleCase(entity.name)}.json`);
  }

  /**
   * Generates the update spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted update spec
   */
  addUpdateSpec(initialIndentation, entity) {
    return utils.formatLine(initialIndentation, 1, 'put:') +
      utils.formatLine(initialIndentation, 2, `description: Update an instance of ${utils.singular(entity.name)}.`) +
      utils.formatLine(initialIndentation, 2, 'body:') +
      utils.formatLine(initialIndentation, 3, 'application/json:') +
      utils.formatLine(initialIndentation, 4, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(initialIndentation, 2, 'responses:') +
      utils.formatLine(initialIndentation, 3, '200:') +
      utils.formatLine(initialIndentation, 4, 'body:') +
      utils.formatLine(initialIndentation, 5, 'application/json:') +
      utils.formatLine(initialIndentation, 6, `type: ${utils.toTitleCase(entity.name)}`) +
      utils.formatLine(initialIndentation, 6, `example: !include examples/${utils.toTitleCase(entity.name)}.json`);
  }

  /**
   * Generates the delete spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted delete spec
   */
  addDeleteSpec(initialIndentation, entity) {
    return utils.formatLine(initialIndentation, 1, 'delete:') +
      utils.formatLine(initialIndentation, 2, `description: Delete an instance of ${utils.singular(entity.name)} based on it's id.`) +
      utils.formatLine(initialIndentation, 2, 'responses:') +
      utils.formatLine(initialIndentation, 3, '204:');
  }
}

module.exports = new SpecGenerator();
