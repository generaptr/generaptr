import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import config from '../../../../src/contentGenerators/api/config/config';

describe('Suite for testing the ConfigGenerator class', () => {
  it('should generate valid config content', () => {
    assert.equal(config.getConfig(), apiMocks.VALID_CONFIG_VALUE);
  });

  it('should generate valid index.js content', () => {
    assert.equal(config.getEnvBasedConfig(), apiMocks.VALID_CONFIG_GET_ENV_BASED_CONFIG);
  });
});
