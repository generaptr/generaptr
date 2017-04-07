const faker = require('faker');
const PROPERTIES_NAME = require('../commons/constants/propertiesName');

class ExamplesContentGenerator {
    constructor() {
        this.DEFAULT_WORD_TYPE = 'noun';
    }

    /**
     * This method returns a fake value for a field name
     * @param field - field name
     */
    generateValue(field) {
        for (let key of Object.keys(PROPERTIES_NAME)) {
            if (PROPERTIES_NAME[key].indexOf(field) >= 0) {
                return faker[key][field]();
            }
        }

        // generate random word
        return faker.lorem.word(this.DEFAULT_WORD_TYPE);
    }
}

module.exports = new ExamplesContentGenerator();

