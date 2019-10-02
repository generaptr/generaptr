import * as assert from 'assert';
import * as fs from 'fs';
import fileUtil from '../../../src/commons/utils/fileUtil';
import utils from '../../../src/commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../../src/commons/constants/directoryStructure';
import ApiFileOperations from '../../../src/fileOperations/ApiFileOperations';
import servicesFileOperations from '../../../src/fileOperations/api/servicesFileOperations';
import apiMocks from '../../testUtils/apiMocks';
import schemaMocks from '../../testUtils/schemaMocks';
import { Table } from "../../../src/commons/types";

describe('Suite for testing the ServicesFileOperations class', () => {
  it('should create all services files for schema', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    servicesFileOperations.initializeServices(apiFileOperations.getFilePath(), schemaMocks.PROCESSED_SCHEMA_ONE_TABLE)
      .then(() => {
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
            assert.strictEqual(data.toString(), apiMocks.VALID_SERVICE_ONE_MODEL);

            done();
          });
      })
      .catch((err: Error) => {
        assert.fail(err.message);
        done();
      });
  });
});
