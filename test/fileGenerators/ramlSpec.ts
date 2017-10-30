import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import RamlFileOperations from '../../src/fieGenerators/raml';
import DIRECTORY_STRUCTURE from '../../src/commons/constants/directoryStructure';
import typesGenerator from '../../src/contentGenerators/spec/types';
import utils from '../../src/commons/utils/utils';
import mocks from '../testUtils/schemaMocks';
import { Table, Schema } from '../../src/commons/types';

const table: Table = {
  name: 'User',
  columns: [
    {
      name: 'id',
      primary: true,
      unique: true,
      allowNull: false,
      dataType: {
        type: 'number',
        size: undefined,
      },
    },
    {
      name: 'firstName',
      primary: false,
      unique: false,
      allowNull: true,
      dataType: {
        type: 'string',
        size: 45,
      },
    },
  ],
};
const schema: Schema = mocks.PROCESSED_SCHEMA_ONE_TABLE;
describe('Suite for testing RamlFileOperation class', () => {

  it('should throw an error if path provided is filePath', () => {
    const ramlFileOperations: RamlFileOperations = new RamlFileOperations('raml.test');
    try {
      ramlFileOperations.createDirectoryStructure();
    } catch (error) {
      assert.equal(error.message, 'Invalid directory path');
    }
  });

  it('should create directory structure', () => {
    const ramlFileOperations: RamlFileOperations = new RamlFileOperations('raml.test');
    try {
      ramlFileOperations.createDirectoryStructure();
      Object.keys(DIRECTORY_STRUCTURE.RAML_STRUCTURE).map((key: string) => {
        fs.stat(
          path.join(
            ramlFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.RAML_STRUCTURE[key],
          ),
          (err: Error, stat: fs.Stats) => {
            if (err) {
              assert.fail(err.message);
            }
            assert.equal(stat.isDirectory(), true);
          });
      });
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should create raml type file', (done: Function) => {
    const ramlFileOperations: RamlFileOperations = new RamlFileOperations('raml.test');
    try {
      ramlFileOperations.createDirectoryStructure();
      ramlFileOperations.generateSchemaTypeFiles([table]);
      fs.readFile(
        path.join(
          ramlFileOperations.getFilePath(),
          DIRECTORY_STRUCTURE.RAML_STRUCTURE.TYPES,
          `${table.name}.raml`,
        ),
        (err: Error, data: Buffer) => {
          assert.ifError(err);
          assert(data, 'Content should not be empty');
          assert.equal(data, typesGenerator.generateTypeContent(table), 'Content should be the same');

          done();
        });
    } catch (error) {
      assert.fail(error.message);
      done();
    }
  });

  it('should create entity.json files', (done: Function) => {
    const ramlFileOperations: RamlFileOperations = new RamlFileOperations('raml.test');
    try {
      ramlFileOperations.createDirectoryStructure();
      ramlFileOperations.generateSchemaExampleFiles(schema);
      fs.readFile(
        path.join(
          ramlFileOperations.getFilePath(),
          DIRECTORY_STRUCTURE.RAML_STRUCTURE.EXAMPLES,
          `${utils.toTitleCase(schema[0].name)}.json`,
        ),
        (err: Error, data: Buffer) => {
          assert.ifError(err);
          assert(data, 'Content should not be empty');
          assert.equal(
            Object.keys(JSON.parse(data.toString())).length,
            schema[0].columns.length,
            'Number of attributes should be the same',
          );

          done();
        },
      );
    } catch (error) {
      assert.fail(error.message);
      done();
    }
  });

  it('should create entity[s].json files', (done: Function) => {
    const ramlFileOperations: RamlFileOperations = new RamlFileOperations('raml.test');
    try {
      ramlFileOperations.createDirectoryStructure();
      ramlFileOperations.generateSchemaExampleFiles(schema);
      ramlFileOperations.generateSchemaExamplesFilesFromCache();
      fs.readFile(
        path.join(
          ramlFileOperations.getFilePath(),
          DIRECTORY_STRUCTURE.RAML_STRUCTURE.EXAMPLES,
          `${utils.pluralize(utils.toTitleCase(schema[0].name))}.json`,
        ),
        (err: Error, data: Buffer) => {
          assert.ifError(err);
          assert(data, 'Countent should not be empty');
          assert.equal(JSON.parse(data.toString()).length, 2, 'Number of entities should be 2');

          for (const entity of JSON.parse(data.toString())) {
            assert.equal(Object.keys(entity).length, 4, 'Number of attributes for every entity should be 4');
          }
          done();
        });
    } catch (error) {
      assert.fail(error.message);
      done();
    }
  });

  it('should create api.raml files', (done: Function) => {
    const ramlFileOperations: RamlFileOperations = new RamlFileOperations('raml.test');
    try {
      ramlFileOperations.generateSchemaApiFiles(
        [{name: 'users', columns: []}],
        {name: 'Test Test', version: 'v1', url: '/', output: ramlFileOperations.getFilePath()},
      );
      fs.readFile(
        path.join(ramlFileOperations.getFilePath(), 'api.raml'), (err: Error, data: Buffer) => {
          assert.ifError(err);
          assert(data, 'Content should not be empty');
          done();
        },
      );
    } catch (error) {
      assert.fail(error.message);
      done();
    }
  });

});
