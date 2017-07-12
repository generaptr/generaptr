const utils = require('../../src/commons/utils/utils');
const assert = require('assert');

describe('utils should work as expected', () => {

  it('should convert to title case', () => {
    assert.equal(utils.toTitleCase('users'), 'User');
  });

  it('should convert to singular', () => {
    assert.equal(utils.singular('users'), 'user');
  });

  it('should convert from array notation to pluralized', () => {
    assert.equal(utils.pluraliseWordArray('User[]'), 'Users');
  });

  it('should convert to json', () => {
    assert.equal(utils.convertToJSON({user: 'test'}), '{\n\t"user": "test"\n}');
  });

  it('should throw an error when trying to pass different query', () => {
    try {
      utils.indexOfIgnoreCase([], 2);
    } catch (e) {
      assert.equal(e.message, 'Index of ignore case works only for string query');
    }
  });

  it('should find the index with the right query', () => {
    assert.equal(utils.indexOfIgnoreCase(['abc'], 'abc'), 0);
  });

  it('should fill the array', () => {
    assert.equal(utils.fillArray({name: 'test'}, 2).length, 2);
  });

  it('should know how to format a line', () => {
    assert.equal(utils.formatLine('  ', 2, 'test'), '      test\n');
  });
});