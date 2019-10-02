import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import express from '../../../../src/generators/api/config/express';

describe('Suite for testing Express class', () => {
  it('should generate valid express config content', () => {
    assert.strictEqual(express.getExpressConfig(), apiMocks.VALID_EXPRESS_CONFIG);
  });
});
