const assert = require('assert');
const before = require('mocha').before;

const mocks = require('../testUtils/mocks');
const ExamplesContentGenerator = require('../../src/ramlGenerator/examplesContentGenerator');

describe('.json entity examples generator', () => {
    before(() => {

        // table mock
        this.schema = mocks.PROCESSED_SCHEMA_MANY_TO_MANY;
    });

    it('should return js entity object for a simple table', () => {
        const groupExample = ExamplesContentGenerator.generateTypeExampleContent(this.schema, this.schema[0], 0);

        assert(groupExample, 'Object should not be null');
        assert(groupExample.type, 'Type should not be null');
        assert.equal(groupExample.type, 'Group', 'Type object should be User');
        assert(groupExample.data, 'Data object should not be null');
        assert.equal(Object.keys(groupExample.data).length, 3, 'Number of data generated should be 3');

      const userExample = ExamplesContentGenerator.generateTypeExampleContent(this.schema, this.schema[1], 0);

      assert(userExample, 'Object should not be null');
      assert(userExample.type, 'Type should not be null');
      assert.equal(userExample.type, 'User', 'Type object should be User');
      assert(userExample.data, 'Data object should not be null');
      assert.equal(Object.keys(userExample.data).length, 4, 'Number of data generated should be 4');
    });
});

