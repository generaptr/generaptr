import * as assert from 'assert';
import * as fs from 'fs';
import fileUtil from '../../../src/commons/utils/fileUtil';
import { ConnectionData } from "../../../src/commons/types";
import DIRECTORY_STRUCTURE from '../../../src/commons/constants/directoryStructure';
import ApiFileOperations from '../../../src/fileOperations/ApiFileOperations';
import configurationsFileOperations from '../../../src/fileOperations/api/configurationsFileOperations';
import apiMocks from '../../testUtils/apiMocks';
import schemaMocks from '../../testUtils/schemaMocks';

describe('Suite for testing the ConfigurationsFileOperations class', () => {
  it('should create config.js file', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    configurationsFileOperations.initializeConfig(apiFileOperations.getFilePath())
      .then(() => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
            'config.js',
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.strictEqual(data.toString(), apiMocks.VALID_CONFIG_VALUE);
            done();
          });
      })
      .catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should create index.js file from config folder', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    configurationsFileOperations.initializeGetEnvBasedConfig(apiFileOperations.getFilePath())
      .then(() => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
            'index.js',
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.strictEqual(data.toString(), apiMocks.VALID_CONFIG_GET_ENV_BASED_CONFIG);
            done();
          });
      })
      .catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should create database.js file from config folder', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    configurationsFileOperations.initializeDbConfig(
      apiMocks.VALID_SEQUELIZE_CONFIG as ConnectionData,
      apiFileOperations.getFilePath())
      .then(() => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
            'database.js',
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.strictEqual(data.toString(), apiMocks.VALID_SEQUELIZE_DATABASE_CONFIG);
            done();
          });
      })
      .catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should create cors.js file from config folder', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    configurationsFileOperations.initializeCorsConfig(apiFileOperations.getFilePath())
      .then(() => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.MIDDLEWARES,
            'cors.js',
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.strictEqual(data.toString(), apiMocks.VALID_CORS_CONFIG);
            done();
          });
      })
      .catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should create express.js file from config folder', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    configurationsFileOperations.initializeExpressConfig(apiFileOperations.getFilePath())
      .then(() => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
            'express.js',
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.strictEqual(data.toString(), apiMocks.VALID_EXPRESS_CONFIG);
            done();
          });
      })
      .catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should create router.js file from config folder', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    configurationsFileOperations.initializeRouterConfig(
      apiFileOperations.getFilePath(),
      schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(() => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
            'router.js',
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.strictEqual(data.toString(), apiMocks.VALID_ROUTER_CONFIG);
            done();
          });
      })
      .catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });

  it('should create index.js main app file', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    configurationsFileOperations.initializeIndex(apiFileOperations.getFilePath())
      .then(() => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.SRC,
            'index.js',
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.strictEqual(data.toString(), apiMocks.VALID_INDEX_FILE);
            done();
          });
      })
      .catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });
});
