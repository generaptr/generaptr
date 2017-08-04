import * as assert from 'assert';
import fileUtil from '../../src/commons/utils/fileUtil';

describe('Suite for testing FileUtil class', () => {
  it('should normalize path', () => {
    assert.equal(fileUtil.normalizePath('./'), `${process.cwd()}/./`);
  });

  it('should create a directory', (done: Function) => {
    fileUtil.createDirectory('/').then(() => {
      done();
    }).catch((e: Error) => {
      assert.fail('create directory failed');
      console.log(e);
    });
  });
});
