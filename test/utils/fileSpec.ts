import * as assert from 'assert';
import fileUtil from '../../src/commons/utils/file';

describe('Suite for testing FileUtil class', () => {
  it('should normalize path', () => {
    assert.equal(fileUtil.normalizePath('./raml.test'), `${process.cwd()}/raml.test`);
  });

  it('should create a directory', () => {
    try {
      assert.equal(fileUtil.createDirectory('api.test'), true);
      assert.equal(fileUtil.createDirectory('raml.test'), true);
    } catch (error) {
      assert.fail('create directory failed');
      console.log(error);
    }
  });
});
