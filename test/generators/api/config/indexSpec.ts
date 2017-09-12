import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import index from '../../../../src/generators/api/config/index';

describe('Suite for testing index.js content class', () => {
  it('should generate valid Index content', () => {
    assert.equal(index.getIndex(), apiMocks.VALID_INDEX_FILE);
  });
});
