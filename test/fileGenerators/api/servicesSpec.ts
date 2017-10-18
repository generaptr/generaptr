import * as assert from 'assert';
import * as fs from 'fs';
import fileUtil from '../../../src/commons/utils/file';
import utils from '../../../src/commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../../src/commons/constants/directoryStructure';
import ApiFileOperations from '../../../src/fieGenerators/api';
import servicesFileOperations from '../../../src/fieGenerators/api/services';
import apiMocks from '../../testUtils/apiMocks';
import schemaMocks from '../../testUtils/schemaMocks';
import { Table } from "../../../src/commons/types";

describe('Suite for testing the ServicesFileOperations class', () => {
  it('should create all services files for schema', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');
    try {
      servicesFileOperations.initializeServices(apiFileOperations.getFilePath(), schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);
      const table: Table = schemaMocks.PROCESSED_SCHEMA_ONE_TABLE[0] as Table;
      const model: string = utils.singular(table.name);

      // Read generated controller
      fs.readFile(
        fileUtil.joinPaths(
          apiFileOperations.getFilePath(),
          DIRECTORY_STRUCTURE.API_STRUCTURE.SERVICES,
          `${model}Service.js`,
        ),
        (err: Error, data: Buffer) => {
          assert.ifError(err);
          assert(data, 'Content should not be empty');
          assert.equal(data.toString(), apiMocks.VALID_SERVICE_ONE_MODEL);

          done();
        });
    } catch (error) {
      assert.fail(error.message);
      done();
    }
  });
});
