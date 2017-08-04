import ramlUtil from '../../src/commons/utils/ramlUtil';
import * as assert from 'assert';

describe('Suite for testing RamlUtil class', () => {
  it('should generate fake data', () => {
    assert.equal(typeof ramlUtil.generateFakeData('asd', 'string'), 'string');
    assert.equal(typeof ramlUtil.generateFakeData('company', 'string'), 'string');
  });

  it('should generate fake ids', () => {
    try {
      assert.equal(typeof ramlUtil.generateId('number'), 'number');
      assert.equal(typeof ramlUtil.generateId('string'), 'string');
      ramlUtil.generateId('not-a-type');
    } catch (e) {
      assert.equal(e.message, 'Not implemented yet');
    }
  });

  it('should know how to parse values', () => {
    assert.equal(ramlUtil.parseRamlValue('2', 'number'), 2);
    assert.equal(ramlUtil.parseRamlValue('2', 'boolean'), true);
    assert.equal(ramlUtil.parseRamlValue('asd', 'not-a-type'), 'asd');
  });

  it('should retrieve random enum values', () => {
    const randomEnumValue: string | number | boolean = ramlUtil.generateFakeData('active', 'enum', ['Yes', 'No']);
    assert(randomEnumValue);
    assert.equal(randomEnumValue === 'Yes' || randomEnumValue === 'No', true);
  });
});
