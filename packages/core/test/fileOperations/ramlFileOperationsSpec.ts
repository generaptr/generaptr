import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import RamlFileOperations from '../../src/fileOperations/ramlFileOperations';
import DIRECTORY_STRUCTURE from '../../src/commons/constants/directoryStructure';
import typesGenerator from '../../src/generators/spec/types';
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
  let tmpDir: string;
  let ramlFileOperations: RamlFileOperations;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'generaptr-'));
    ramlFileOperations = new RamlFileOperations(tmpDir);
    await ramlFileOperations.createDirectoryStructure();
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should throw an error if path provided is filePath', async () => {
    const fileOperations: RamlFileOperations = new RamlFileOperations(path.join(tmpDir, 'raml.test'));

    try {
      await fileOperations.createDirectoryStructure();
    } catch (exception) {
      assert.strictEqual(exception, 'Invalid directory path');
    }
  });

  it('should create directory structure', async () => {
    await ramlFileOperations.createDirectoryStructure();

    for (const key of Object.keys(DIRECTORY_STRUCTURE.RAML_STRUCTURE)) {
      const stat = await fs.stat(path.join(ramlFileOperations.getFilePath(), DIRECTORY_STRUCTURE.RAML_STRUCTURE[key]));
      assert.strictEqual(stat.isDirectory(), true);
    }
  });

  it('should create raml type file', async () => {
    await ramlFileOperations.createDirectoryStructure();
    await ramlFileOperations.generateSchemaTypeFiles([table]);

    const data: Buffer = await fs.readFile(
      path.join(ramlFileOperations.getFilePath(), DIRECTORY_STRUCTURE.RAML_STRUCTURE.TYPES, `${table.name}.raml`),
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(data.toString('ascii'), typesGenerator.generateTypeContent(table), 'Content should be the same');
  });

  it('should create entity.json files', async () => {
    await ramlFileOperations.createDirectoryStructure();
    await ramlFileOperations.generateSchemaExampleFiles(schema);

    const data: Buffer = await fs.readFile(
      path.join(
        ramlFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.RAML_STRUCTURE.EXAMPLES,
        `${utils.toTitleCase(schema[0].name)}.json`,
      ),
    );
    assert(data, 'Content should not be empty');
    assert.strictEqual(
      Object.keys(JSON.parse(data.toString())).length,
      schema[0].columns.length,
      'Number of attributes should be the same',
    );
  });

  it('should create entity[s].json files', async () => {
    await ramlFileOperations.createDirectoryStructure();
    await ramlFileOperations.generateSchemaExampleFiles(schema);
    await ramlFileOperations.generateSchemaExamplesFilesFromCache();

    const data: Buffer = await fs.readFile(
      path.join(
        ramlFileOperations.getFilePath(),
        DIRECTORY_STRUCTURE.RAML_STRUCTURE.EXAMPLES,
        `${utils.pluralize(utils.toTitleCase(schema[0].name))}.json`,
      ),
    );
    assert(data, 'Countent should not be empty');
    assert.strictEqual(JSON.parse(data.toString()).length, 2, 'Number of entities should be 2');

    for (const entity of JSON.parse(data.toString())) {
      assert.strictEqual(Object.keys(entity).length, 4, 'Number of attributes for every entity should be 4');
    }
  });

  it('should create api.raml files', async () => {
    await ramlFileOperations.generateSchemaApiFiles(
      [{ name: 'users', columns: [] }],
      { name: 'Test Test', version: 'v1', url: '/', output: ramlFileOperations.getFilePath() },
    );

    const data: Buffer = await fs.readFile(path.join(ramlFileOperations.getFilePath(), 'api.raml'));
    assert(data, 'Content should not be empty');
  });

});
