import * as pluralize from 'pluralize';
import config from '../../configs/config';

/**
 * Export utils class.
 *
 * @export
 */
export class Utils {

  /**
   * Convert data type name to 'Object' naming
   * @param  word - eg: users
   * @returns  eg: User
   */
  public toTitleCase(word: string): string {
    const initialPosition: number = 0;
    const secondWord: number = 1;

    return pluralize
      .singular(
        word
          .charAt(initialPosition)
          .toUpperCase() +
        word
          .substring(secondWord),
      );
  }

  /**
   * Convert word to it's table name
   * @param  word = eg: User
   * @return  eg: users
   */
  public toTableName(word: string): string {
    return this.pluralize(word.toLowerCase());
  }

  /**
   * Convert word to comply with the column name schema.
   *
   * @returns  eg: user_id
   */
  public toColumnName(word: string): string {
    return word.replace(/(?:Id|_id)\b/g, '');
  }
  /**
   * Pluralizes a word.
   * @param  word - eg: user
   * @return  eg: users
   */
  public pluralize(word: string): string {
    return pluralize.plural(word);
  }

  /**
   * Convert plural word into singular
   * @param  word - word to be singularized
   * @returns  - singularized word
   */
  public singular(word: string): string {
    return pluralize.singular(word);
  }

  /**
   * Pluralise a word that contains [] at the end
   * @param  word - string object
   * @return  - Example: input: User[]; output: Users
   */
  public pluraliseWordArray(word: string): string {
    const initialPosition: number = 0;

    return word.includes('[]') ? pluralize.plural(word.substring(initialPosition, word.indexOf('[]'))) : word;
  }

  /**
   * Convert js plain object into JSON string
   * @param  object - object to be converted
   * @return  stringy version of js object
   */
  public convertToJSON(object: Object): string {
    return JSON.stringify(object, undefined, '\t');
  }

  /**
   * IndexOf implementation with ignore case
   * @param  haystack - array of strings
   * @param  needle - query string
   * @return  key of the query inside the array
   */
  public indexOfIgnoreCase(haystack: string[], needle: string): number {
    return haystack.findIndex((item: string) => needle.toLowerCase() === item.toLowerCase());
  }

  /**
   * Returns an array of a certain length with same object
   * @param  object - js plain object
   * @param  length - length of returned array
   * @return  filled array
   */
  public fillArray(object: Object, length: number): Object[] {
    const start: number = 0;

    return new Array(length).fill(object, start, length);
  }

  /**
   * Formats the line for spec.
   *
   * @param  initialIndentation - holds the initial indentation
   * @param  tabs - holds how many tabs should prepend to the line
   * @param  message - holds the actual content of the line
   * @return  - returns the formatted line
   */
  public formatLine(initialIndentation: string, tabs: number, message: string): string {
    let line: string = `${initialIndentation}`;
    for (let i: number = 0; i < tabs; i += 1) {
      line += `${config.DEFAULT_INDENTATION}`;
    }
    line += `${message}${config.END_OF_LINE}`;

    return line;
  }

  /**
   * Find the common edit distance between two strings.
   *
   * @param  needle string which will be matched
   * @param  haystack string to be matched against
   * @returns  common edit distance between strings
   */
  private editDistance(needle: string, haystack: string): number {
    const costs: number[] = new Array();
    for (let i: number = 0; i <= needle.toLowerCase().length; i += 1) {
      let lastValue: number = i;
      for (let j: number = 0; j <= haystack.length; j += 1) {
        if (i === 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue: number = costs[j - 1];
            if (
              needle
                .toLowerCase()
                .charAt(i - 1) !==
              haystack
                .toLowerCase()
                .charAt(j - 1)
            ) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) {
        costs[haystack.length] = lastValue;
      }
    }

    return costs[haystack.length];
  }

  /**
   * Finds the similarity between two strings
   *
   * @returns  percentage of similarity as float
   */
  public similarity(needle: string, haystack: string): number {
    let longer: string = needle;
    let shorter: string = haystack;
    if (needle.length < haystack.length) {
      longer = haystack;
      shorter = needle;
    }
    const longerLength: number = longer.length;
    if (longerLength === 0) {
      return 1;
    }

    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength.toFixed(2));
  }
}

export default new Utils();
