/**
 * Converts the relational way of storing enum values into an array of strings.
 *
 * @param {string?} raw - string format of the enum values
 * @returns {string[]} - array of string values
 */
export const getValues: (raw?: string) => string[] = (raw?: string): string[] => {
  return raw ? raw.substring(4).replace(/["'()]/g, '').replace(' ', '').split(',') : [];
}