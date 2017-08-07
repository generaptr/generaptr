import * as pluralize from 'pluralize';
import config from '../../configs/config';

/**
 * Export utils class.
 *
 * @export
 * @class Utils
 */
export class Utils {

  /**
   * Convert data type name to 'Object' naming
   * @param {string} word - eg: users
   * @returns {string} eg: User
   */
  public toTitleCase(word: string): string {
    const initialPosition: number = 0;
    const secondWord: number = 1;

    return pluralize.singular(word.charAt(initialPosition).toUpperCase() + word.substring(secondWord));
  }

  /**
   * Convert word to it's table name
   * @param {string} word = eg: User
   * @return {string} eg: users
   */
  public toTableName(word: string): string {
    return this.pluralize(word.toLowerCase());
  }
  /**
   * Pluralizes a word.
   * @param {string} word - eg: user
   * @return {string} eg: users
   */
  public pluralize(word: string): string {
    return pluralize.plural(word);
  }

  /**
   * Convert plural word into singular
   * @param {string} word - word to be singularized
   * @returns {string} - singularized word
   */
  public singular(word: string): string {
    return pluralize.singular(word);
  }

  /**
   * Pluralise a word that contains [] at the end
   * @param {string} word - string object
   * @return {string} - Example: input: User[]; output: Users
   */
  public pluraliseWordArray(word: string): string {
    const initialPosition: number = 0;

    return word.includes('[]') ? pluralize.plural(word.substring(initialPosition, word.indexOf('[]'))) : word;
  }

  /**
   * Convert js plain object into JSON string
   * @param {{}} object - object to be converted
   * @return {string} stringy version of js object
   */
  public convertToJSON(object: Object): string {
    return JSON.stringify(object, undefined, '\t');
  }

  /**
   * IndexOf implementation with ignore case
   * @param {string[]} haystack - array of strings
   * @param {string} needle - query string
   * @return {number} key of the query inside the array
   */
  public indexOfIgnoreCase(haystack: string[], needle: string): number {
    return haystack.findIndex((item: string) => needle.toLowerCase() === item.toLowerCase());
  }

  /**
   * Returns an array of a certain length with same object
   * @param {{}} object - js plain object
   * @param {int} length - length of returned array
   * @return {Array.<{}>} filled array
   */
  public fillArray(object: Object, length: number): Object[] {
    const start: number = 0;

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
  public formatLine(initialIndentation: string, tabs: number, message: string): string {
    let line: string = `${initialIndentation}`;
    for (let i: number = 0; i < tabs; i++) {
      line += `${config.DEFAULT_INDENTATION}`;
    }
    line += `${message}${config.END_OF_LINE}`;

    return line;
  }
}

export default new Utils();
