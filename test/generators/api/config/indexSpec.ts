import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import index from '../../../../src/generators/api/config/index';

describe('Suite for testing Index class', () => {
  it('should generate valid index.js content', () => {
    assert.strictEqual(index.getIndex(), apiMocks.VALID_INDEX_FILE);
  });
});
