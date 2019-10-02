import ramlUtil from '../../src/commons/utils/ramlUtil';
import * as assert from 'assert';

describe('Suite for testing RamlUtil class', () => {
  it('should generate fake data', () => {
    assert.strictEqual(typeof ramlUtil.generateFakeData('asd', 'string'), 'string');
    assert.strictEqual(typeof ramlUtil.generateFakeData('company', 'string'), 'string');
  });

  it('should generate fake ids', () => {
    try {
      assert.strictEqual(typeof ramlUtil.generateId('number'), 'number');
      assert.strictEqual(typeof ramlUtil.generateId('string'), 'string');
      ramlUtil.generateId('not-a-type');
    } catch (e) {
      assert.strictEqual(e.message, 'Not implemented yet');
    }
  });

  it('should know how to parse values', () => {
    assert.strictEqual(ramlUtil.parseRamlValue('2', 'number'), 2);
    assert.strictEqual(ramlUtil.parseRamlValue('2', 'boolean'), true);
    assert.strictEqual(ramlUtil.parseRamlValue('asd', 'not-a-type'), 'asd');
  });

  it('should retrieve random enum values', () => {
    const randomEnumValue: string | number | boolean = ramlUtil.generateFakeData('active', 'enum', ['Yes', 'No']);
    assert(randomEnumValue);
    assert.strictEqual(randomEnumValue === 'Yes' || randomEnumValue === 'No', true);
  });
});
