import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ApiFileOperations from '../../src/fileOperations/apiFileOperations';
import DIRECTORY_STRUCTURE from '../../src/commons/constants/directoryStructure';
import schemaMocks from '../testUtils/schemaMocks';
import apiMocks from '../testUtils/apiMocks';
import { ConnectionData } from "../../src/commons/types";

describe('Suite for testing ApiFileOperation class', () => {
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

  const isFile = async (...segments: string[]): Promise<boolean> =>
    (await fs.stat(path.join(apiFileOperations.getFilePath(), ...segments))).isFile();

  it('should throw an error if path provided is filePath', async () => {
    const fileOperations: ApiFileOperations = new ApiFileOperations(path.join(tmpDir, 'api.test'));

    try {
      await fileOperations.createDirectoryStructure();
    } catch (exception) {
      assert.strictEqual(exception, 'Invalid directory path');
    }
  });

  it('should create directory structure', async () => {
    await apiFileOperations.createDirectoryStructure();

    for (const key of Object.keys(DIRECTORY_STRUCTURE.API_STRUCTURE)) {
      const stat = await fs.stat(path.join(apiFileOperations.getFilePath(), DIRECTORY_STRUCTURE.API_STRUCTURE[key]));
      assert.strictEqual(stat.isDirectory(), true);
    }
  });

  it('should create config files', async () => {
    await apiFileOperations.initializeConfig(
      apiMocks.VALID_SEQUELIZE_CONFIG as ConnectionData,
      schemaMocks.PROCESSED_SCHEMA_ONE_TABLE,
    );

    // Config folder
    for (const file of ['config.js', 'index.js', 'database.js', 'express.js', 'router.js']) {
      assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG, file), true);
    }
    // Middlewares folder
    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.MIDDLEWARES, 'cors.js'), true);
    // Main index
    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.SRC, 'index.js'), true);
  });

  it('should create util.js and statusCode.js files', async () => {
    await apiFileOperations.initializeCommons();

    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.COMMONS, 'util.js'), true);
    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.CONSTANTS, 'statusCode.js'), true);
  });

  it('should create services files', async () => {
    await apiFileOperations.initializeServices(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);

    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.SERVICES, 'userService.js'), true);
  });

  it('should create controller files', async () => {
    await apiFileOperations.initializeControllers(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);

    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS, 'userController.js'), true);
  });

  it('should create a package json', async () => {
    assert.strictEqual(await apiFileOperations.createPackageJson(apiMocks.PACKAGE_JSON_CONFIG, 'MySql'), true);

    assert.strictEqual(await isFile('package.json'), true);
  });

  it('should install required dependencies', async () => {
    await apiFileOperations.installDependencies('MySql');

    const stat = await fs.stat(path.join(apiFileOperations.getFilePath(), 'node_modules'));
    assert.strictEqual(stat.isDirectory(), true);
  }, 300000);

  it('should not fail install required dependencies for unknown dialects', async () => {
    await apiFileOperations.installDependencies('');

    const stat = await fs.stat(path.join(apiFileOperations.getFilePath(), 'node_modules'));
    assert.strictEqual(stat.isDirectory(), true);
  }, 300000);

  it('should know how to initialize ORM', async () => {
    await apiFileOperations.initializeORM('MySql');

    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS, 'index.js'), true);
  });

  it('should throw an error when trying to initialize ORM for unknown database', async () => {
    await assert.rejects(apiFileOperations.initializeORM(''), (err: unknown) => err === 'Dialect not supported');
  });

  it('should know how to generate models', async () => {
    await apiFileOperations.initializeModels('MySql', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);

    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS, 'User.js'), true);
  });

  it('should throw an error when trying to initialize models for unknown database', async () => {
    await assert.rejects(
      apiFileOperations.initializeModels('', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE),
      (err: unknown) => err === 'Dialect not supported',
    );
  });

  it('should know how to generate repositories', async () => {
    await apiFileOperations.initializeRepositories('MySql', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);

    assert.strictEqual(await isFile(DIRECTORY_STRUCTURE.API_STRUCTURE.REPOSITORIES, 'UserRepository.js'), true);
  });

  it('should throw an error when trying to initialize repositories for unknown database', async () => {
    await assert.rejects(
      apiFileOperations.initializeRepositories('', schemaMocks.PROCESSED_SCHEMA_ONE_TABLE),
      (err: unknown) => err === 'Dialect not supported',
    );
  });
});
