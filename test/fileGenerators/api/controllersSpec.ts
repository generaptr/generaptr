import * as assert from 'assert';
import * as fs from 'fs';
import fileUtil from '../../../src/commons/utils/file';
import utils from '../../../src/commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../../src/commons/constants/directoryStructure';
import ApiFileOperations from '../../../src/fieGenerators/api';
import controllersFileOperations from '../../../src/fieGenerators/api/controllers';
import apiMocks from '../../testUtils/apiMocks';
import schemaMocks from '../../testUtils/schemaMocks';
import { Table } from "../../../src/commons/types";

describe('Suite for testing the ControllersFileOperations class', () => {
  it('should create all controller files for schema', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');
    try {
      controllersFileOperations.initializeControllers(apiFileOperations.getFilePath(), schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);
      const table: Table = schemaMocks.PROCESSED_SCHEMA_ONE_TABLE[0] as Table;
      const model: string = utils.singular(table.name);

      // Read generated controller
      fs.readFile(
        fileUtil.joinPaths(
          apiFileOperations.getFilePath(),
          DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS,
          `${model}Controller.js`,
        ),
        (err: Error, data: Buffer) => {
          assert.ifError(err);
          assert(data, 'Content should not be empty');
          assert.equal(data.toString(), apiMocks.VALID_CONTROLLER_ONE_MODEL);

          // Read default controller content
          fs.readFile(
            fileUtil.joinPaths(
              apiFileOperations.getFilePath(),
              DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS,
              'defaultController.js',
            ),
            (error: Error, d: Buffer) => {
              assert.ifError(error);
              assert(data, 'Content should not be empty');
              assert.equal(d.toString(), apiMocks.VALID_DEFAULT_CONTROLLER);

              done();
            });
          });
    } catch (error) {
      assert.fail(error.message);
      done();
    }
  });
});
