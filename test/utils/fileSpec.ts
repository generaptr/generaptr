import * as assert from 'assert';
import fileUtil from '../../src/commons/utils/file';

describe('Suite for testing FileUtil class', () => {
  it('should normalize path', () => {
    assert.equal(fileUtil.normalizePath('./'), `${process.cwd()}/./`);
  });

  it('should create a directory', () => {
    try {
      assert.equal(fileUtil.createDirectory('/'), true);
    } catch (error) {
      assert.fail('create directory failed');
      console.log(error);
    }
  });
});
