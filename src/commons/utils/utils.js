const pluralize = require('pluralize');
const faker = require('faker');
const PROPERTIES_NAME = require('../constants/propertiesName');

class Utils {

    constructor() {
        this.DEFAULT_WORD_TYPE = 'noun';
    }

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
     * Generate fake data for a field name
     * @param field - field name
     * @param type - data raml type: can be number / string / Boolean / date etc
     * @return - fake data
     */
    generateFakeData(field, type) {
        for (let key of Object.keys(PROPERTIES_NAME)) {
            if (PROPERTIES_NAME[key].indexOf(field) >= 0) {
                return this.parseRamlValue(faker[key][field](), type);
            }

            // special case
            if (key === field) {
                // get first option for this category provided by faker api
                return this.parseRamlValue(faker[key][PROPERTIES_NAME[key][0]](), type);
            }
        }

        // special case for id / _id
        if (field === 'id' || field === '_id') {
            switch(type) {
                case 'number':
                    return faker.random.number(Number.MAX_SAFE_INTEGER);
                case 'string':
                    return faker.random.uuid();
            }
        }

        // generate random word using lipsum
        return this.parseRamlValue(faker.lorem.word(this.DEFAULT_WORD_TYPE), type);
    }

    /**
     * Parse object value to a custom raml type
     * @param value - value to be parsed
     * @param type - raml type
     * @return {*}
     */
    parseRamlValue(value, type) {
        try {
            switch(type) {
                case 'number':
                    return parseInt(value);
                case 'string':
                    return value.toString();
                case 'boolean':
                    return Boolean(value);
                default:
                    return value;
            }
        } catch (exception) {
            return value;
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
}

module.exports = new Utils();