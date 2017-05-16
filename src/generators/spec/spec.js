const utils = require('../../commons/utils/utils');

const END_OF_LINE = '\n';
const DEFAULT_INDENTATION = '  ';

class SpecGenerator {

  /**
   * Generates the api spec for the whole schema.
   *
   * @param {*} schema - entire collection of tables
   * @param {*} options - holds the title of the app, the version and the base url
   * @return {*}
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
    return this.formatLine('', 0, '#%RAML 1.0') +
      this.formatLine('', 0, `title: ${options.name}`) +
      this.formatLine('', 0, `version: ${options.version}`) +
      this.formatLine('', 0, `baseUri: ${options.url}{version}`) +
      this.formatLine('', 0, 'protocols: [HTTP, HTTPS]');
  }

  /**
   * Adds the data types based on schema
   *
   * @param {*} schema - entire collection of tables
   * @return {string} returns the formatted data types
   */
  addDataTypes(schema) {
    let types = `types:${END_OF_LINE}`;

    schema.forEach(entity => {
      types += this.formatLine(
        DEFAULT_INDENTATION,
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
    let spec = `/${entity.name}:${END_OF_LINE}`;
    spec += this.addGetAllSpec(DEFAULT_INDENTATION, entity);
    spec += this.addCreateSpec(DEFAULT_INDENTATION, entity);
    spec += this.formatLine(DEFAULT_INDENTATION, 0, `/{${utils.singular(entity.name)}Id}:`);
    spec += this.addGetOneSpec(DEFAULT_INDENTATION, entity);
    spec += this.addUpdateSpec(DEFAULT_INDENTATION, entity);
    spec += this.addDeleteSpec(DEFAULT_INDENTATION, entity);

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
    return this.formatLine(initialIndentation, 0, 'get:') +
      this.formatLine(initialIndentation, 1, `description: Get a list of all ${entity.name}`) +
      this.formatLine(initialIndentation, 1, 'responses:') +
      this.formatLine(initialIndentation, 2, '200:') +
      this.formatLine(initialIndentation, 3, 'body:') +
      this.formatLine(initialIndentation, 4, 'application/json:') +
      this.formatLine(initialIndentation, 5, `type: ${utils.toTitleCase(entity.name)}[]`) +
      this.formatLine(initialIndentation, 5, `example: !include examples/${utils.pluralize(utils.toTitleCase(entity.name))}.json`);
  }

  /**
   * Generates the create spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted create spec
   */
  addCreateSpec(initialIndentation, entity) {
    return this.formatLine(initialIndentation, 0, 'post:') +
      this.formatLine(initialIndentation, 1, `description: Create a ${utils.singular(entity.name)}`) +
      this.formatLine(initialIndentation, 1, 'body:') +
      this.formatLine(initialIndentation, 2, 'application/json:') +
      this.formatLine(initialIndentation, 3, `type: ${utils.toTitleCase(entity.name)}`) +
      this.formatLine(initialIndentation, 1, 'responses:') +
      this.formatLine(initialIndentation, 2, '201:') +
      this.formatLine(initialIndentation, 3, 'body:') +
      this.formatLine(initialIndentation, 4, 'application/json:') +
      this.formatLine(initialIndentation, 5, `type: ${utils.toTitleCase(entity.name)}`) +
      this.formatLine(initialIndentation, 5, `example: !include examples/${utils.toTitleCase(entity.name)}.json`);
  }

  /**
   * Generates the get one spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted get one spec
   */
  addGetOneSpec(initialIndentation, entity) {
    return this.formatLine(initialIndentation, 1, 'get:') +
      this.formatLine(initialIndentation, 2, `description: Get an instance of ${utils.singular(entity.name)} based on it's id.`) +
      this.formatLine(initialIndentation, 2, 'responses:') +
      this.formatLine(initialIndentation, 3, '200:') +
      this.formatLine(initialIndentation, 4, 'body:') +
      this.formatLine(initialIndentation, 5, 'application/json:') +
      this.formatLine(initialIndentation, 6, `type: ${utils.toTitleCase(entity.name)}`) +
      this.formatLine(initialIndentation, 6, `example: !include examples/${utils.toTitleCase(entity.name)}.json`);
  }

  /**
   * Generates the update spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted update spec
   */
  addUpdateSpec(initialIndentation, entity) {
    return this.formatLine(initialIndentation, 1, 'put:') +
      this.formatLine(initialIndentation, 2, `description: Update an instance of ${utils.singular(entity.name)}.`) +
      this.formatLine(initialIndentation, 2, 'body:') +
      this.formatLine(initialIndentation, 3, 'application/json:') +
      this.formatLine(initialIndentation, 4, `type: ${utils.toTitleCase(entity.name)}`) +
      this.formatLine(initialIndentation, 2, 'responses:') +
      this.formatLine(initialIndentation, 3, '200:') +
      this.formatLine(initialIndentation, 4, 'body:') +
      this.formatLine(initialIndentation, 5, 'application/json:') +
      this.formatLine(initialIndentation, 6, `type: ${utils.toTitleCase(entity.name)}`) +
      this.formatLine(initialIndentation, 6, `example: !include examples/${utils.toTitleCase(entity.name)}.json`);
  }

  /**
   * Generates the delete spec
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {*} entity - holds the entity definition
   * @return {string} - returns the formatted delete spec
   */
  addDeleteSpec(initialIndentation, entity) {
    return this.formatLine(initialIndentation, 1, 'delete:') +
      this.formatLine(initialIndentation, 2, `description: Delete an instance of ${utils.singular(entity.name)} based on it's id.`) +
      this.formatLine(initialIndentation, 2, 'responses:') +
      this.formatLine(initialIndentation, 3, '204:');
  }

  /**
   * Formats the line for spec.
   *
   * @param {string} initialIndentation - holds the initial indentation
   * @param {number} tabs - holds how many tabs should prepend to the line
   * @param {string} message - holds the actual content of the line
   * @return {string} - returns the formatted line
   */
  formatLine(initialIndentation, tabs, message) {
    let line = `${initialIndentation}`;
    for (let i = 0; i < tabs; i++) {
      line += `${DEFAULT_INDENTATION}`;
    }
    line += `${message}${END_OF_LINE}`;

    return line;
  }
}

module.exports = new SpecGenerator();
