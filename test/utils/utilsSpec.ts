import utils from '../../src/commons/utils/utils';
import * as assert from 'assert';

describe('Suite for testing Utils class', () => {

  it('should convert to title case', () => {
    assert.strictEqual(utils.toTitleCase('users'), 'User');
  });

  it('should convert to table name', () => {
    assert.strictEqual(utils.toTableName('User'), 'users');
  });

  it('should pluralize any word', () => {
    assert.strictEqual(utils.pluralize('user'), 'users');
  });

  it('should convert to singular', () => {
    assert.strictEqual(utils.singular('users'), 'user');
  });

  it('should convert from array notation to pluralized', () => {
    assert.strictEqual(utils.pluraliseWordArray('User[]'), 'Users');
    assert.strictEqual(utils.pluraliseWordArray('Users'), 'Users');
  });

  it('should convert to json', () => {
    assert.strictEqual(utils.convertToJSON({ user: 'test' }), '{\n\t"user": "test"\n}');
  });

  it('should find the index with the right query', () => {
    assert.strictEqual(utils.indexOfIgnoreCase(['abc'], 'abc'), 0);
  });

  it('should fill the array', () => {
    assert.strictEqual(utils.fillArray({ name: 'test' }, 2).length, 2);
  });

  it('should know how to format a line', () => {
    assert.strictEqual(utils.formatLine('  ', 2, 'test'), '      test\n');
  });
});
