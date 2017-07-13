const pluralize = require('pluralize');
const config = require('../../configs/config');

class Utils {

  /**
   * Convert data type name to 'Object' naming
   * @param {string} word - eg: users
   * @returns {string} eg: User
   */
  toTitleCase(word) {
    const initialPosition = 0;
    const secondWord = 1;
    return pluralize.singular(word.charAt(initialPosition).toUpperCase() + word.substring(secondWord));
  }

  /**
   * @param {string} word - eg: user
   * @return {*} eg: users
   */
  pluralize(word) {
    return pluralize.plural(word);
  }

  /**
   * Convert plural word into singular
   * @param {string} word - word to be singularized
   * @returns {*} - singularized word
   */
  singular(word) {
    return pluralize.singular(word);
  }

  /**
   * Pluralise a word that contains [] at the end
   * @param {string} word - string object
   * @return {string} - Example: input: User[]; output: Users
   */
  pluraliseWordArray(word) {
    const initialPosition = 0;
    return word.includes('[]') ? pluralize.plural(word.substring(initialPosition, word.indexOf('[]'))) : word;
  }

  /**
   * Convert js plain object into JSON string
   * @param {*} object - object to be converted
   * @return {string} stringy version of js object
   */
  convertToJSON(object) {
    return JSON.stringify(object, null, '\t');
  }

  /**
   * IndexOf implementation with ignore case
   * @param {Array} array - array of strings
   * @param {string} query - query string
   * @return {number} key of the query inside the array
   */
  indexOfIgnoreCase(array, query) {
    if (typeof query !== 'string') {
      throw new Error('Index of ignore case works only for string query');
    }

    return array.findIndex(item => query.toLowerCase() === item.toLowerCase());
  }

  /**
   * Returns an array of a certain length with same object
   * @param {*} object - js plain object
   * @param {int} length - length of returned array
   * @return {Array.<*>} filled array
   */
  fillArray(object, length) {
    const start = 0;
    return new Array(length).fill(object, start, length);
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
      line += `${config.DEFAULT_INDENTATION}`;
    }
    line += `${message}${config.END_OF_LINE}`;

    return line;
  }
}

module.exports = new Utils();
