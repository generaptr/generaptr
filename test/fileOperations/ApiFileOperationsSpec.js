const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ApiFileOperations = require('../../src/fileOperations/ApiFileOperations');
const DIRECTORY_STRUCTURE = require('../../src/commons/constants/directoryStructure');

describe('api file operations', () => {

  it('should throw an error if path is not provided', () => {
    try {
      new ApiFileOperations();
    } catch (exception) {
      assert.equal(exception.message, 'FilePath not provided');
    }
  });

  it('should throw an error if path provided is filePath', (done) => {
    let apiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.createDirectoryStructure()
      .then(() => {
        done();
      })
      .catch(exception => {
        assert.equal(exception, 'Invalid directory path');
        done();
      })
  });

  it('should create directory structure', () => {
    let apiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.createDirectoryStructure()
      .then(() => {
        Object.values(DIRECTORY_STRUCTURE.API_STRUCTURE).map(key => {
          fs.stat(path.join(apiFileOperations.filePath, key), (err, stat) => {
            if (err) {
              assert.fail();
            }
            assert.equal(stat.isDirectory(), true);
          });
        })
      })
      .catch(exception => {
        assert.fail();
      })
  });

});