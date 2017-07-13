const assert = require('assert');
const schemaUtil = require('../../src/commons/utils/schemaUtil');

describe('it should help handling the schema', () => {

  it('should get normalized table by type', () => {
    const table = schemaUtil.getNormalizedTableByType([{name: 'users'}], 'User');
    assert.equal(table.name, 'users');
  });

  it('should return false if nothing found', () => {
    const table = schemaUtil.getNormalizedTableByType([{name: 'users'}], 'Account');
    assert.equal(table, false);
  });

  it('should convert raml values', () => {
    const values = ['Yes', 'No'];

    const ramlValues = schemaUtil.valuesToRamlDataType(values);
    assert(ramlValues);
    assert.equal(ramlValues.length, 8);
    assert.equal(ramlValues, 'Yes | No');
  })
});