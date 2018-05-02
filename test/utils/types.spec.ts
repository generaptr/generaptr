import * as assert from 'assert';
import * as types from '../../src/utils/types';

describe('Type Utils', () => {
  it('should properly get the values from an enum', () => {
    assert.deepEqual(types.getValues(`'yes', 'no'`), ['yes', 'no']);
    assert.deepEqual(types.getValues(''), []);
  });
});