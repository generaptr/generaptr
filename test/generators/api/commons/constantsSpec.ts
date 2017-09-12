import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import constants from '../../../../src/generators/api/commons/constants';

describe('Suite for testing the constants class', () => {
  it('should generate a valid constants content', () => {
    assert.equal(constants.getStatusCode(), apiMocks.VALID_STATUS_CODES_CONSTANTS);
  });
});
