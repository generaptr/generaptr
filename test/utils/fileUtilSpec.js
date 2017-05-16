const assert = require('assert');
const fileUtil = require('../../src/commons/utils/fileUtil');

describe('should help with file operations', () => {
  it('should normalize path', () => {
    process.platform = 'win32';
    assert.equal(fileUtil.normalizePath('./'), `${process.cwd()}/./`);
  });

  it('should create a directory', (done) => {
    fileUtil.createDirectory('/').then(() => {
      done();
    }).catch(e => console.log(e));
  })
});