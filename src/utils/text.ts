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
 * Casts a given word to it's plural form.
 *
 * @param {string} word - word to be casted to plural
 * @returns {string} - plural form of the given word
 */
export const toPlural: (word: string) => string = (word: string): string =>
  pluralize.plural(word);

/**
 * Casts a given word to it's title case form.
 *
 * @param {string} word - word to be casted to title case
 * @returns {string} - title case form of the given word
 */
export const toTitleCase: (word: string) => string = (word: string): string =>
  pluralize.singular(word.charAt(0).toUpperCase() + word.substring(1));

/**
 * Convert word to comply with the column name schema.
 *
 * @param {string} word eg: user_id
 * @returns {string} eg: user
 */
export const toColumnName = (word: string): string => {
    return word.replace(/(?:Id|_id)\b/g, '');
  }

/**
 * Find the common edit distance between two strings.
 *
 * @param {string} needle string which will be matched
 * @param {string} haystack string to be matched against
 * @returns {number} common edit distance between strings
 */
const editDistance = (needle: string, haystack: string): number  => {
  const costs: number[] = new Array();
  for (let i: number = 0; i <= needle.toLowerCase().length; i++) {
    let lastValue: number = i;
    for (let j: number = 0; j <= haystack.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue: number = costs[j - 1];
          if (needle.toLowerCase().charAt(i - 1) !== haystack.toLowerCase().charAt(j - 1)) {
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
};

/**
 * Finds the similarity between two strings
 *
 * @param {string} needle
 * @param {string} haystack
 * @returns {number} percentage of similarity as float
 */
export const similarity = (needle: string, haystack: string): number => {
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

  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toFixed(2));
}