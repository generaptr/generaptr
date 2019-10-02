import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import config from '../../../../src/generators/api/config/config';

describe('Suite for testing the Config class', () => {
  it('should generate valid config content', () => {
    assert.strictEqual(config.getConfig(), apiMocks.VALID_CONFIG_VALUE);
  });

  it('should generate valid index.js content', () => {
    assert.strictEqual(config.getEnvBasedConfig(), apiMocks.VALID_CONFIG_GET_ENV_BASED_CONFIG);
  });
});
