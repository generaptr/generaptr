import utils from '../../src/commons/utils/utils';
import * as assert from 'assert';

describe('Suite for testing Utils class', () => {

  it('should convert to title case', () => {
    assert.equal(utils.toTitleCase('users'), 'User');
  });

  it('should convert to table name', () => {
    assert.equal(utils.toTableName('User'), 'users');
  });

  it('should pluralize any word', () => {
    assert.equal(utils.pluralize('user'), 'users');
  });

  it('should convert to singular', () => {
    assert.equal(utils.singular('users'), 'user');
  });

  it('should convert from array notation to pluralized', () => {
    assert.equal(utils.pluraliseWordArray('User[]'), 'Users');
    assert.equal(utils.pluraliseWordArray('Users'), 'Users');
  });

  it('should convert to json', () => {
    assert.equal(utils.convertToJSON({user: 'test'}), '{\n\t"user": "test"\n}');
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
