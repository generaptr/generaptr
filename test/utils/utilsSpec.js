const utils = require('../../src/commons/utils/utils');
const assert = require('assert');

describe('utils should work as expected', () => {

  it('should convert to title case', () => {
    assert.equal('User', utils.toTitleCase('users'));
  });

  it('should convert to singular', () => {
    assert.equal('user', utils.singular('users'));
  });

  it('should convert from array notation to pluralized', () => {
    assert.equal('Users', utils.pluraliseWordArray('User[]'));
  });

  it('should convert to json', () => {
    assert.equal('{\n\t"user": "test"\n}', utils.convertToJSON({user: 'test'}));
  });

  it('should throw an error when trying to pass different query', () => {
    try {
      utils.indexOfIgnoreCase([], 2);
    } catch (e) {
      assert.equal('Index of ignore case works only for string query', e.message);
    }
  });

  it('should find the index with the right query', () => {
    assert.equal(0, utils.indexOfIgnoreCase(['abc'], 'abc'));
  });

  it('should fill the array', () => {
    assert.equal(2, utils.fillArray({name: 'test'}, 2).length);
  });
});