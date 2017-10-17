import * as assert from 'assert';
import apiMocks from '../../../testUtils/apiMocks';
import express from '../../../../src/contentGenerators/api/config/express';

describe('Suite for testing ExpressGenerator class', () => {
  it('should generate valid express config content', () => {
    assert.equal(express.getExpressConfig(), apiMocks.VALID_EXPRESS_CONFIG);
  });
});
