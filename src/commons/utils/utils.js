const pluralize = require('pluralize');

class Utils {

    /**
     * Convert data type name to 'Object' naming
     * @param word - eg:
     */
    toTitleCase(word) {
        return pluralize.singular(word.charAt(0).toUpperCase() + word.substring(1));
    }

    /**
     * Convert plural word into singular
     * @param word - word to be singularized
     * @returns {*}
     */
    singular(word) {
        return pluralize.singular(word);
    }

    /**
     * Pluralise a word that contains [] at the end
     * @param word - string object
     * @return {*} - Example: input: User[]; output: Users
     */
    pluraliseWordArray(word) {
        if (word.includes('[]')) {
            return pluralize.plural(word.substring(0, word.indexOf('[]')));
        }
    }

    /**
     * Convert js plain object into JSON string
     * @param object - object to be converted
     * @return - stringy version of js object
     */
    convertToJSON(object) {
        return JSON.stringify(object, null, '\t');
    }

    /**
     * IndexOf implementation with ignore case
     * @param array - array of strings
     * @param query - query string
     * @return {number}
     */
    indexOfIgnoreCase(array, query) {
        if (typeof query !== 'string') {
            throw new Error('Index of ignore case works only for string query');
        }

        return array.findIndex(item => query.toLowerCase() === item.toLowerCase());
    }

    /**
     * Returns an array of a certain length with same object
     * @param object - js plain object
     * @param length - length of returned array
     * @return {Array.<*>}
     */
    fillArray(object, length) {
        return new Array(length).fill(object, 0, length);
    }
}

module.exports = new Utils();