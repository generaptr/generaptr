import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import cors from '../../../../src/generators/api/config/cors';

describe('Suite for testing the Cors class', () => {
  it('should generate valid cors content', () => {
    assert.strictEqual(cors.getCorsConfig(), apiMocks.VALID_CORS_CONFIG);
  });
});
