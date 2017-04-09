const typeConverter = require('../../src/commons/utils/typeConverter');
const assert = require('assert');

describe('it should convert types to standard', () => {
  it('should convert to string types', () => {
    assert.equal('string', typeConverter.convertSqlType('varchar'));
  });

  it('should convert to number type', () => {
    assert.equal('number', typeConverter.convertSqlType('decimal'));
  });

  it('should convert to date-only type', () => {
    assert.equal('date-only', typeConverter.convertSqlType('date'));
  });

  it('should convert to datetime type', () => {
    assert.equal('datetime', typeConverter.convertSqlType('datetime'));
  });

  it('should convert to time-only type', () => {
    assert.equal('time-only', typeConverter.convertSqlType('time'));
  });

  it('should throw an error if type not found', () => {
    try {
      typeConverter.convertSqlType('type-that-does-not-exist');
    } catch (e) {
      assert.equal('Type not found', e.message);
    }
  });

  it('should throw an error for no-sql types as those are not implemented yet', () => {
    try {
      typeConverter.convertNoSqlType('int');
    } catch (e) {
      assert.equal('Not yet implemented', e.message);
    }
  });

});