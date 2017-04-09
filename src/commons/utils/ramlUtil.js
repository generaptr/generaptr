const faker = require('faker');
const Utils = require('./utils');
const PROPERTIES_NAME = require('../constants/propertiesName');

class RamlUtil {
    constructor() {
        this.DEFAULT_WORD_TYPE = 'noun';
    }

    /**
     * Generate fake data for a field name
     * @param field - field name
     * @param type - data raml type: can be number / string / Boolean / date etc
     * @return - fake data
     */
    generateFakeData(field, type) {
        for (let key of Object.keys(PROPERTIES_NAME)) {
            // ignore camel case for attributes
            const index = Utils.indexOfIgnoreCase(PROPERTIES_NAME[key], field.toString());

            if (index >= 0) {
                return this.parseRamlValue(faker[key][PROPERTIES_NAME[key][index]](), type);
            }

            // special case
            if (key.toLowerCase() === field.toLowerCase()) {
                // get first option for this category provided by faker api
                return this.parseRamlValue(faker[key][PROPERTIES_NAME[key][0]](), type);
            }
        }

        // special case for id / _id
        if (field === 'id' || field === '_id') {
            return this.generateId(type);
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
     * Generate id/_id field value
     * @param type - can be number / string / boolean
     * @return {*}
     */
    generateId(type) {
        switch(type) {
            case 'number':
                return faker.random.number(Number.MAX_SAFE_INTEGER);
            case 'string':
                return faker.random.uuid();
            default:
                throw new Error('Not implemented yet');
        }
    }
}

module.exports = new RamlUtil();