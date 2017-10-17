import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import cors from '../../../../src/contentGenerators/api/config/cors';

describe('Suite for testing the CorsGenerator class', () => {
  it('should generate valid cors content', () => {
    assert.equal(cors.getCorsConfig(), apiMocks.VALID_CORS_CONFIG);
  });
});
