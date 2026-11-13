import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import fileUtil from '../../../src/commons/utils/fileUtil';
import utils from '../../../src/commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../../src/commons/constants/directoryStructure';
import ApiFileOperations from '../../../src/fileOperations/apiFileOperations';
import servicesFileOperations from '../../../src/fileOperations/api/servicesFileOperations';
import apiMocks from '../../testUtils/apiMocks';
import schemaMocks from '../../testUtils/schemaMocks';
import { Table } from "../../../src/commons/types";

describe('Suite for testing the ServicesFileOperations class', () => {
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

  it('should create all services files for schema', async () => {
    await servicesFileOperations.initializeServices(apiFileOperations.getFilePath(), schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);
    const table: Table = schemaMocks.PROCESSED_SCHEMA_ONE_TABLE[0] as Table;
    const model: string = utils.singular(table.name);

    // Read generated service
    const data: string = await fs.readFile(
      fileUtil.joinPaths(apiFileOperations.getFilePath(), DIRECTORY_STRUCTURE.API_STRUCTURE.SERVICES, `${model}Service.js`),
      'utf-8',
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data, apiMocks.VALID_SERVICE_ONE_MODEL);
  });
});
