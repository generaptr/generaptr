const assert = require('assert');
const before = require('mocha').before;

const mocks = require('../testUtils/mocks');
const ExamplesContentGenerator = require('../../src/ramlGenerator/examplesContentGenerator');

describe('.json entity examples generator', () => {
    before(() => {

        // table mock
        this.schema = mocks.SCHEMA_ONE_TABLE;
    });

    it('should return js entity object for a simple table', () => {
        const objectGenerated = ExamplesContentGenerator.generateTypeExampleContent(this.schema, this.schema[0], 0);

        assert(objectGenerated, 'Object should not be null');
        assert.equal(objectGenerated.type, 'Type should not be null');
        assert.equal(objectGenerated.type, 'User', 'Type object should be User');
        assert(objectGenerated.data, 'Data object should not be null');
        assert.equal(Object.keys(objectGenerated.data).length, 4, 'Number of data generated should be 4');
    });
});

