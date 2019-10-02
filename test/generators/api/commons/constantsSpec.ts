import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import constants from '../../../../src/generators/api/commons/constants';

describe('Suite for testing the Constants class', () => {
  it('should generate a valid constants content', () => {
    assert.strictEqual(constants.getStatusCode(), apiMocks.VALID_STATUS_CODES_CONSTANTS);
  });
});
