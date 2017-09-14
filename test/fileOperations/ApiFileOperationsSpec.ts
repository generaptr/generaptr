import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import ApiFileOperations from '../../src/fileOperations/ApiFileOperations';
import DIRECTORY_STRUCTURE from '../../src/commons/constants/directoryStructure';
import schemaMocks from '../testUtils/schemaMocks';
import apiMocks from '../testUtils/apiMocks';
import { ConnectionData } from "../../src/commons/types";

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

  it('should create config files', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations
      .initializeConfig(apiMocks.VALID_SEQUELIZE_CONFIG as ConnectionData, schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(async () => {
        const promises: [Promise<boolean>] = [Promise.resolve(true)];

        // Config folder
        ['config.js', 'index.js', 'database.js', 'express.js', 'router.js'].forEach((file: string) => {
          promises.push(new Promise((resolve: Function, reject: Function): boolean => {
            fs.stat(
              path.join(
                apiFileOperations.getFilePath(),
                DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
                file,
              ),
              (err: Error, stats: fs.Stats) => {
                if (err) {
                  return reject(err);
                }

                return resolve(stats.isFile());
              });
          }));
        });

        // Middlewares folder
        promises.push(new Promise((resolve: Function, reject: Function): boolean => {
          fs.stat(
            path.join(
              apiFileOperations.getFilePath(),
              DIRECTORY_STRUCTURE.API_STRUCTURE.MIDDLEWARES,
              'cors.js',
            ),
            (err: Error, stats: fs.Stats) => {
              if (err) {
                return reject(err);
              }

              return resolve(stats.isFile());
            });
        }));

        // Main index
        promises.push(new Promise((resolve: Function, reject: Function): boolean => {
          fs.stat(
            path.join(
              apiFileOperations.getFilePath(),
              DIRECTORY_STRUCTURE.API_STRUCTURE.SRC,
              'index.js',
            ),
            (err: Error, stats: fs.Stats) => {
              if (err) {

                return reject(err);
              }

              return resolve(stats.isFile());
            });
        }));

        Promise.all(promises)
          .then(async () => {
            done();
          })
          .catch((error: Error) => {
            assert.fail(error.message);
            done();
          });
      })
      .catch((error: Error) => {
        assert.fail(error.message);
        done();
      });
  });

  it('should create util.js and statusCode.js files', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeCommons()
      .then(async () => {
        // Check util.js file
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.COMMONS,
            "util.js",
          ),
          (err: Error, stats: fs.Stats) => {
            assert.ifError(err);
            assert.equal(stats.isFile(), true);

            // Check statusCode.js file
            fs.stat(
              path.join(
                apiFileOperations.getFilePath(),
                DIRECTORY_STRUCTURE.API_STRUCTURE.CONSTANTS,
                "statusCode.js",
              ),
              (error: Error, state: fs.Stats) => {
                assert.ifError(error);
                assert.equal(state.isFile(), true);
                done();
              });
          });
      })
      .catch((error: Error) => {
        assert.fail(error.message);
        done();
      });
  });

  it('should create services files', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeServices(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(async () => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.SERVICES,
            'userService.js',
          ),
          (err: Error, stats: fs.Stats) => {
            assert.ifError(err);
            assert.equal(stats.isFile(), true);
            done();
          },
        );
      })
      .catch((error: Error) => {
        assert.fail(error.message);
        done();
      });
  });

  it('should create controller files', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeControllers(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(async () => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS,
            'userController.js',
          ),
          (err: Error, stats: fs.Stats) => {
            assert.ifError(err);
            assert.equal(stats.isFile(), true);
            done();
          },
        );
      })
      .catch((error: Error) => {
        assert.fail(error.message);
        done();
      });
  });
});
