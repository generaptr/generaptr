import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import fileUtil from '../../../src/commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../../../src/commons/constants/directoryStructure';
import ApiFileOperations from '../../../src/fileOperations/apiFileOperations';
import commonsFileOperations from '../../../src/fileOperations/api/commonsFileOperations';
import apiMocks from '../../testUtils/apiMocks';

describe('Suite for testing the CommonsFileOperations class', () => {
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

  it('should create util.js file', async () => {
    await commonsFileOperations.initializeUtil(apiFileOperations.getFilePath());

    const data: string = await fs.readFile(
      fileUtil.joinPaths(apiFileOperations.getFilePath(), DIRECTORY_STRUCTURE.API_STRUCTURE.COMMONS, 'util.js'),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_UTIL_CLASS);
  });

  it('should create statusCode.js file', async () => {
    await commonsFileOperations.initializeConstants(apiFileOperations.getFilePath());

    const data: string = await fs.readFile(
      fileUtil.joinPaths(apiFileOperations.getFilePath(), DIRECTORY_STRUCTURE.API_STRUCTURE.CONSTANTS, 'statusCode.js'),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_STATUS_CODES_CONSTANTS);
  });
});
