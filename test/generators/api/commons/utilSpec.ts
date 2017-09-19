import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import util from '../../../../src/generators/api/commons/util';

describe('Suite for testing the Util class', () => {
  it('should generate valid util class content', () => {
    assert.equal(util.getUtil(), apiMocks.VALID_UTIL_CLASS);
  });
});
