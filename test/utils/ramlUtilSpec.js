const ramlUtil = require('../../src/commons/utils/ramlUtil');
const assert = require('assert');

describe('it should help with raml opertions', () => {
  it('should generate fake data', () => {
    assert.equal('string', typeof ramlUtil.generateFakeData('asd', 'string'));
    assert.equal('string', typeof ramlUtil.generateFakeData('company', 'string'));
  });

  it('should generate fake ids', () => {
    try {
      assert.equal('number', typeof ramlUtil.generateId('number'));
      assert.equal('string', typeof ramlUtil.generateId('string'));
      ramlUtil.generateId('not-a-type');
    } catch (e) {
      assert.equal('Not implemented yet', e.message);
    }
  });

  it('should know how to parse values', () => {
    assert.equal(2, ramlUtil.parseRamlValue('2', 'number'));
    assert.equal('2', ramlUtil.parseRamlValue(2, 'string'));
    assert.equal(true, ramlUtil.parseRamlValue('2', 'boolean'));
    assert.equal('asd', ramlUtil.parseRamlValue('asd', 'not-a-type'));
  });

});
