import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import util from '../../../../src/generators/api/commons/util';

describe('Suite for testing the AppError class', () => {
  it('should generate a valid AppError content', () => {
    assert.strictEqual(util.getAppError(), apiMocks.VALID_APP_ERROR_CLASS);
  });
});
