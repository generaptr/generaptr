import typeUtil from '../../src/commons/utils/typeUtil';
import { DataType } from '../../src/commons/types';
import * as assert from 'assert';

describe('Suite for testing TypeConverter class', () => {
  it('should convert to string types', () => {
    assert.strictEqual(typeUtil.convertSqlType('varchar'), 'string');
  });

  it('should convert to number type', () => {
    assert.strictEqual(typeUtil.convertSqlType('decimal'), 'number');
  });

  it('should convert to date-only type', () => {
    assert.strictEqual(typeUtil.convertSqlType('date'), 'date-only');
  });

  it('should convert to datetime type', () => {
    assert.strictEqual(typeUtil.convertSqlType('datetime'), 'datetime');
  });

  it('should convert to time-only type', () => {
    assert.strictEqual(typeUtil.convertSqlType('time'), 'time-only');
  });

  it('should throw an error if type not found', () => {
    try {
      typeUtil.convertSqlType('type-that-does-not-exist');
    } catch (e) {
      assert.strictEqual(e.message, 'Type not found');
    }
  });

  it('should throw an error for no-sql types as those are not implemented yet', () => {
    try {
      typeUtil.convertNoSqlType('int');
    } catch (e) {
      assert.strictEqual(e.message, 'int not yet implemented.');
    }
  });

  it('should should convert raml enum types', () => {
    const converted: DataType = typeUtil.convertRamlTypes({ type: 'Yes | No', items: '' });
    assert.strictEqual(converted.type, 'enum');
    if (!converted.values) {
      assert.fail('conversion failed');
    } else {
      assert.strictEqual(converted.values.length, 2);
    }
  });

  it('should should convert raml array types', () => {
    const converted: DataType = typeUtil.convertRamlTypes({ type: 'array', items: 'User' });
    assert.strictEqual(converted.type, 'User');
    assert.strictEqual(converted.isArray, true);
  });

  it('should should convert raml ordinary types', () => {
    const converted: DataType = typeUtil.convertRamlTypes({ type: 'number', items: '' });
    assert.strictEqual(converted.type, 'number');
    assert.strictEqual(converted.isArray, false);
  });

  it('should convert enum data type to string', () => {
    const asString: string = typeUtil.getEnumValuesAsString({ type: 'enum', values: ['Yes', 'No'] });
    assert.strictEqual(asString, `'Yes', 'No'`);

    assert.strictEqual('', typeUtil.getEnumValuesAsString({ type: 'string' }));
  });

  it('should detect if given type is part of raml default types', () => {
    assert.strictEqual(typeUtil.isDefaultType('number'), true);
    assert.strictEqual(typeUtil.isDefaultType('User'), false);
  });
});
