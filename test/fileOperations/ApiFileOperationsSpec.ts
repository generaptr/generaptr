import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import ApiFileOperations from '../../src/fileOperations/ApiFileOperations';
import DIRECTORY_STRUCTURE from '../../src/commons/constants/directoryStructure';

describe('Suite for testing ApiFileOperation class', () => {

  it('should throw an error if path provided is filePath', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.createDirectoryStructure()
      .then(() => {
        done();
      })
      .catch((exception: Error) => {
        assert.equal(exception, 'Invalid directory path');
        done();
      });
  });

  it('should create directory structure', () => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.createDirectoryStructure()
      .then(() => {
        Object.keys(DIRECTORY_STRUCTURE.API_STRUCTURE).map((key: string) => {
          fs.stat(
            path.join(
              apiFileOperations.getFilePath(),
              DIRECTORY_STRUCTURE.API_STRUCTURE[key],
            ),
            (err: Error, stat: fs.Stats) => {
              if (err) {
                assert.fail(err.message);
              }
              assert.equal(stat.isDirectory(), true);
            });
        });
      })
      .catch((exception: Error) => {
        assert.fail(exception.message);
      });
  });
});
