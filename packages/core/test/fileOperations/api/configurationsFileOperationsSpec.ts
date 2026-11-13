import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import fileUtil from '../../../src/commons/utils/fileUtil';
import { ConnectionData } from "../../../src/commons/types";
import DIRECTORY_STRUCTURE from '../../../src/commons/constants/directoryStructure';
import ApiFileOperations from '../../../src/fileOperations/apiFileOperations';
import configurationsFileOperations from '../../../src/fileOperations/api/configurationsFileOperations';
import apiMocks from '../../testUtils/apiMocks';
import schemaMocks from '../../testUtils/schemaMocks';

describe('Suite for testing the ConfigurationsFileOperations class', () => {
  let tmpDir: string;
  let apiFileOperations: ApiFileOperations;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'generaptr-'));
    apiFileOperations = new ApiFileOperations(tmpDir);
    await apiFileOperations.createDirectoryStructure();
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should create config.js file', async () => {
    await configurationsFileOperations.initializeConfig(apiFileOperations.getFilePath());

    const data: string = await fs.readFile(
      fileUtil.joinPaths(
        apiFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
        'config.js',
      ),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_CONFIG_VALUE);
  });

  it('should create index.js file from config folder', async () => {
    await configurationsFileOperations.initializeGetEnvBasedConfig(apiFileOperations.getFilePath());

    const data: string = await fs.readFile(
      fileUtil.joinPaths(
        apiFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
        'index.js',
      ),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_CONFIG_GET_ENV_BASED_CONFIG);
  });

  it('should create database.js file from config folder', async () => {
    await configurationsFileOperations.initializeDbConfig(
      apiMocks.VALID_SEQUELIZE_CONFIG as ConnectionData,
      apiFileOperations.getFilePath());

    const data: string = await fs.readFile(
      fileUtil.joinPaths(
        apiFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
        'database.js',
      ),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_SEQUELIZE_DATABASE_CONFIG);
  });

  it('should create cors.js file from config folder', async () => {
    await configurationsFileOperations.initializeCorsConfig(apiFileOperations.getFilePath());

    const data: string = await fs.readFile(
      fileUtil.joinPaths(
        apiFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.API_STRUCTURE.MIDDLEWARES,
        'cors.js',
      ),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_CORS_CONFIG);
  });

  it('should create express.js file from config folder', async () => {
    await configurationsFileOperations.initializeExpressConfig(apiFileOperations.getFilePath());

    const data: string = await fs.readFile(
      fileUtil.joinPaths(
        apiFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
        'express.js',
      ),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_EXPRESS_CONFIG);
  });

  it('should create router.js file from config folder', async () => {
    await configurationsFileOperations.initializeRouterConfig(
      apiFileOperations.getFilePath(),
      schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);

    const data: string = await fs.readFile(
      fileUtil.joinPaths(
        apiFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG,
        'router.js',
      ),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_ROUTER_CONFIG);
  });

  it('should create index.js main app file', async () => {
    await configurationsFileOperations.initializeIndex(apiFileOperations.getFilePath());

    const data: string = await fs.readFile(
      fileUtil.joinPaths(
        apiFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.API_STRUCTURE.SRC,
        'index.js',
      ),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_INDEX_FILE);
  });
});
