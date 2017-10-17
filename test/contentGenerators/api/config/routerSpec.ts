import * as assert from 'assert';
import schemaMocks from '../../../testUtils/schemaMocks';
import apiMocks from '../../../testUtils/apiMocks';
import router from '../../../../src/contentGenerators/api/config/router';

describe('Suite for testing RouterGenerator class', () => {
  it('should generate valid router content', () => {
    assert.equal(router.getRouterConfig(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE), apiMocks.VALID_ROUTER_CONFIG);
  });
});
