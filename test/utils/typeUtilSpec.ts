import typeUtil from '../../src/commons/utils/typeUtil';
import { DataType } from '../../src/commons/types';
import * as assert from 'assert';

describe('Suite for testing TypeConverter class', () => {
  it('should convert to string types', () => {
    assert.equal(typeUtil.convertSqlType('varchar'), 'string');
  });

  it('should convert to number type', () => {
    assert.equal(typeUtil.convertSqlType('decimal'), 'number');
  });

  it('should convert to date-only type', () => {
    assert.equal(typeUtil.convertSqlType('date'), 'date-only');
  });

  it('should convert to datetime type', () => {
    assert.equal(typeUtil.convertSqlType('datetime'), 'datetime');
  });

  it('should convert to time-only type', () => {
    assert.equal(typeUtil.convertSqlType('time'), 'time-only');
  });

  it('should throw an error if type not found', () => {
    try {
      typeUtil.convertSqlType('type-that-does-not-exist');
    } catch (e) {
      assert.equal(e.message, 'Type not found');
    }
  });

  it('should throw an error for no-sql types as those are not implemented yet', () => {
    try {
      typeUtil.convertNoSqlType('int');
    } catch (e) {
      assert.equal(e.message, 'int not yet implemented.');
    }
  });

  it('should should convert raml enum types', () => {
      const converted: DataType = typeUtil.convertRamlTypes({type: 'Yes | No', items: ''});
      assert.equal(converted.type, 'enum');
      if (!converted.values) {
        assert.fail('conversion failed');
      } else {
        assert.equal(converted.values.length, 2);
      }
  });

  it('should should convert raml array types', () => {
    const converted: DataType = typeUtil.convertRamlTypes({type: 'array', items: 'User'});
    assert.equal(converted.type, 'User');
    assert.equal(converted.isArray, true);
  });

  it('should should convert raml ordinary types', () => {
    const converted: DataType = typeUtil.convertRamlTypes({type: 'number', items: ''});
    assert.equal(converted.type, 'number');
    assert.equal(converted.isArray, false);
  });

  it('should convert enum data type to string', () => {
    const asString: string = typeUtil.getEnumValuesAsString({type: 'enum', values: ['Yes', 'No']});
    assert.equal(asString, `'Yes', 'No'`);

    assert.equal('', typeUtil.getEnumValuesAsString({type: 'string'}));
  });

  it('should detect if given type is part of raml default types', () => {
    assert.equal(typeUtil.isDefaultType('number'), true);
    assert.equal(typeUtil.isDefaultType('User'), false);
  });
});
