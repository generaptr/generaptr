import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import index from '../../../../src/contentGenerators/api/config/index';

describe('Suite for testing IndexGenerator class', () => {
  it('should generate valid index.js content', () => {
    assert.equal(index.getIndex(), apiMocks.VALID_INDEX_FILE);
  });
});
