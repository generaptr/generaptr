import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import controller from '../../../../src/generators/api/controllers/controller';

describe('Suite for testing the Controllers class', () => {
  it('should generate valid default controller content', () => {
    assert.strictEqual(controller.getDefaultController(), apiMocks.VALID_DEFAULT_CONTROLLER);
  });

  it('should generate valid controller content for one model', () => {
    assert.strictEqual(controller.getController('user'), apiMocks.VALID_CONTROLLER_ONE_MODEL);
  });
});
