import assert from 'node:assert';
import fileUtil from '../../src/commons/utils/fileUtil';

describe('Suite for testing FileUtil class', () => {
  it('should normalize path', () => {
    assert.strictEqual(fileUtil.normalizePath('./'), `${process.cwd()}/./`);
  });

  it('should create a directory', async () => {
    assert.strictEqual(await fileUtil.createDirectory('/'), true);
  });
});
