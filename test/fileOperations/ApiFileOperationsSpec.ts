import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import ApiFileOperations from '../../src/fileOperations/ApiFileOperations';
import DIRECTORY_STRUCTURE from '../../src/commons/constants/directoryStructure';
import apiMocks from '../testUtils/apiMocks';
import schemaMocks from '../testutils/schemaMocks';

describe('Suite for testing ApiFileOperation class', () => {

  it('should throw an error if path provided is filePath', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.createDirectoryStructure()
      .then(async () => {
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
      .then(async () => {
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

  it('should create a package json', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.createPackageJson(apiMocks.PACKAGE_JSON_CONFIG, 'MySql')
    .then(async () => {
      fs.stat(
        path.join(
          apiFileOperations.getFilePath(),
          'package.json',
        ),
        (err: Error, stat: fs.Stats) => {
          if (err) {
            assert.fail(err.message);
          }
          assert.equal(stat.isFile(), true);
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
    .then(async () => {
      fs.stat(
        path.join(
          apiFileOperations.getFilePath(),
          'node_modules',
        ),
        (err: Error, stat: fs.Stats) => {
          if (err) {
            assert.fail(err.message);
          }
          assert.equal(stat.isDirectory(), true);
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
    .then(async () => {
      fs.stat(
        path.join(
          apiFileOperations.getFilePath(),
          'node_modules',
        ),
        (err: Error, stat: fs.Stats) => {
          if (err) {
            assert.fail(err.message);
          }
          assert.equal(stat.isDirectory(), true);
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
    .then(async () => {
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
          assert.equal(stats.isFile(), true);
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
    .then(async () => {
      assert.fail('should throw an error');
      done();
    }).catch((err: string) => {
      assert.equal(err, 'Dialect not supported');
      done();
    });
  });

  it('should know how to generate models', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeModels('MySql', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
    .then(async () => {
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
          assert.equal(stats.isFile(), true);
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
    .then(async () => {
      assert.fail('should throw an error');
      done();
    }).catch((err: string) => {
      assert.equal(err, 'Dialect not supported');
      done();
    });
  });


  it('should know how to generate repositories', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    apiFileOperations.initializeRepositories('MySql', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
    .then(async () => {
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
          assert.equal(stats.isFile(), true);
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
    .then(async () => {
      assert.fail('should throw an error');
      done();
    }).catch((err: string) => {
      assert.equal(err, 'Dialect not supported');
      done();
    });
  });
});
