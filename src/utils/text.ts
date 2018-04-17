import * as pluralize from 'pluralize';

/**
 * Casts a given word to it's singular form.
 *
 * @param {string} word - word to be casted to singular
 * @returns {string} - singular form of the given word
 */
export const toSingular: (word: string) => string = (word: string): string =>
  pluralize.singular(word);

/**
 * Casts a given word to it's title case form.
 *
 * @param {string} word - word to be casted to title case
 * @returns {string} - title case form of the given word
 */
export const toTitleCase: (word: string) => string = (word: string): string =>
  pluralize.singular(word.charAt(0).toUpperCase() + word.substring(1));
