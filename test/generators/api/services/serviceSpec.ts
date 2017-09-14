import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import service from '../../../../src/generators/api/services/service';

describe('Suite for testing the Services class', () => {
  it('should generate valid service content for one model', () => {
    assert.equal(service.getService('User'), apiMocks.VALID_SERVICE_ONE_MODEL);
  });
});
