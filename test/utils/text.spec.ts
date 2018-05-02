import * as assert from 'assert';
import * as text from '../../src/utils/text';

describe('Text Utils', () => {

  it('should properly cast a word to singular', () => {
    assert.equal(text.toSingular('words'), 'word');
    assert.equal(text.toSingular('word'), 'word');
  });

  it('should properly cast a word to plural', () => {
    assert.equal(text.toPlural('word'), 'words');
    assert.equal(text.toPlural('words'), 'words');
  });

  it('should properly cast a word to title case', () => {
    assert.equal(text.toTitleCase('word'), 'Word');
    assert.equal(text.toTitleCase('Word'), 'Word');
  });

  it('should properly cast a word to column name', () => {
    assert.equal(text.toColumnName('word_id'), 'word');
    assert.equal(text.toColumnName('word_Id'), 'word');
    assert.equal(text.toColumnName('wordId'), 'word');
    assert.equal(text.toColumnName('word'), 'word');
  });

  it('should properly calculate the word similarity', () => {
    assert.equal(text.similarity('word', 'words') >= 0.8, true);
    assert.equal(text.similarity('', ''), 1);
    assert.equal(text.similarity('word', 'something else') < 0.5, true);
  });
});