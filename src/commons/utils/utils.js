const pluralize = require('pluralize');

class Utils {

    /**
     * Convert data type name to 'Object' naming
     * @param word - eg:
     */
    toTitleCase(word) {
        return pluralize.singular(word.charAt(0).toUpperCase() + word.substring(1));
    }

    singular(word) {
        return pluralize.singular(word);
    }

};

module.exports = new Utils();