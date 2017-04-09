const assert = require('assert');
const BaseHandler = require('../../src/handlers/BaseHandler');

const handler = new BaseHandler();

describe('base handler', () => {
  it('should throw an error for unknown driver when normalizing column schema', () => {
    try {
      handler.normalizeColumnSchema({});
    } catch (e) {
      assert.equal(e.message, 'Database driver not supported.');
    }
  });

  it('should throw an error for unknown driver when normalizing db schema', () => {
    try {
      handler.normalizeRelations([{}]);
    } catch (e) {
      assert.equal(e.message, 'Database driver not supported.');
    }
  });
});