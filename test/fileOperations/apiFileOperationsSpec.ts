import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import ApiFileOperations from '../../src/fileOperations/apiFileOperations';
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
        assert.strictEqual(exception, 'Invalid directory path');
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
              assert.strictEqual(stat.isDirectory(), true);
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
      .then(() => {
        const promises: [Promise<boolean>] = [Promise.resolve(true)];

        // Config folder
        ['config.js', 'index.js', 'database.js', 'router.js'].forEach((file: string) => {
          promises.push(new Promise((resolve: Function, reject: Function): void => {
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
        promises.push(new Promise((resolve: Function, reject: Function): void => {
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
        promises.push(new Promise((resolve: Function, reject: Function): void => {
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
          .then(() => {
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
      .then(() => {
        // Check util.js file
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.COMMONS,
            "util.js",
          ),
          (err: Error, stats: fs.Stats) => {
            assert.ifError(err);
            assert.strictEqual(stats.isFile(), true);

            // Check statusCode.js file
            fs.stat(
              path.join(
                apiFileOperations.getFilePath(),
                DIRECTORY_STRUCTURE.API_STRUCTURE.CONSTANTS,
                "statusCode.js",
              ),
              (error: Error, state: fs.Stats) => {
                assert.ifError(error);
                assert.strictEqual(state.isFile(), true);
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
      .then(() => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.SERVICES,
            'userService.js',
          ),
          (err: Error, stats: fs.Stats) => {
            assert.ifError(err);
            assert.strictEqual(stats.isFile(), true);
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
      .then(() => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS,
            'userController.js',
          ),
          (err: Error, stats: fs.Stats) => {
            assert.ifError(err);
            assert.strictEqual(stats.isFile(), true);
            done();
          },
        );
      })
      .catch((error: Error) => {
        assert.fail(error.message);
        done();
      });
  });

  it('should create a package json', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.createPackageJson(apiMocks.PACKAGE_JSON_CONFIG, 'MySql')
      .then(() => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            'package.json',
          ),
          (err: Error, stat: fs.Stats) => {
            if (err) {
              assert.fail(err.message);
            }
            assert.strictEqual(stat.isFile(), true);
            done();
          },
        );
      }).catch((error: Error) => {
        assert.fail(error.message);
        done();
      });
  });

  it('should install required dependencies', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.installDependencies('MySql')
      .then(() => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            'node_modules',
          ),
          (err: Error, stat: fs.Stats) => {
            if (err) {
              assert.fail(err.message);
            }
            assert.strictEqual(stat.isDirectory(), true);
            done();
          },
        );
      }).catch((error: Error) => {
        assert.fail(error.message);
        done();
      });
  }).timeout(50000);

  it('should not fail install required dependencies for unknown dialects', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.installDependencies('')
      .then(() => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            'node_modules',
          ),
          (err: Error, stat: fs.Stats) => {
            if (err) {
              assert.fail(err.message);
            }
            assert.strictEqual(stat.isDirectory(), true);
            done();
          },
        );
      }).catch((error: Error) => {
        assert.fail(error.message);
        done();
      });
  }).timeout(50000);

  it('should know how to initialize ORM', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeORM('MySql')
      .then(() => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS,
            'index.js',
          ),
          (err: Error, stats: fs.Stats) => {
            if (err) {
              assert.fail(err.message);
            }
            assert.strictEqual(stats.isFile(), true);
            done();
          },
        );
      }).catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should throw an error when trying to initialize ORM for unknown database', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeORM('')
      .then(() => {
        assert.fail('should throw an error');
        done();
      }).catch((err: string) => {
        assert.strictEqual(err, 'Dialect not supported');
        done();
      });
  });

  it('should know how to generate models', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeModels('MySql', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(() => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS,
            'User.js',
          ),
          (err: Error, stats: fs.Stats) => {
            if (err) {
              assert.fail(err.message);
            }
            assert.strictEqual(stats.isFile(), true);
            done();
          },
        );
      }).catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should throw an error when trying to initialize models for unknown database', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeModels('', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(() => {
        assert.fail('should throw an error');
        done();
      }).catch((err: string) => {
        assert.strictEqual(err, 'Dialect not supported');
        done();
      });
  });

  it('should know how to generate repositories', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeRepositories('MySql', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(() => {
        fs.stat(
          path.join(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.REPOSITORIES,
            'UserRepository.js',
          ),
          (err: Error, stats: fs.Stats) => {
            if (err) {
              assert.fail(err.message);
            }
            assert.strictEqual(stats.isFile(), true);
            done();
          },
        );
      }).catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should throw an error when trying to initialize repositories for unknown database', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeRepositories('', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(() => {
        assert.fail('should throw an error');
        done();
      }).catch((err: string) => {
        assert.strictEqual(err, 'Dialect not supported');
        done();
      });
  });
});
