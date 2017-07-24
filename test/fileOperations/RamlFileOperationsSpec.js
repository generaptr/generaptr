const assert = require('assert');
const fs = require('fs');
const path = require('path');
const RamlFileOperations = require('../../src/fileOperations/RamlFileOperations');
const DIRECTORY_STRUCTURE = require('../../src/commons/constants/directoryStructure');
const typesGenerator = require('../../src/generators/spec/types');
const Utils = require('../../src/commons/utils/utils');
const mocks = require('../testUtils/mocks');

describe('raml file operations', () => {
  beforeEach(() => {
    // table mock
    this.table = {
      name: 'User',
      columns: [
        {
          name: 'id',
          allowNull: false,
          dataType: {
            type: 'number',
            size: null
          },
        },
        {
          name: 'firstName',
          allowNull: true,
          dataType: {
            type: 'string',
            size: 45
          },
        }
      ]
    };
    this.schema = mocks.PROCESSED_SCHEMA_ONE_TABLE;
  });

  it('should throw an error if path is not provided', () => {
    try {
      new RamlFileOperations();
    } catch (exception) {
      assert.equal(exception.message, 'FilePath not provided');
    }
  });

  it('should throw an error if path provided is filePath', (done) => {
    let ramlFileOperations = new RamlFileOperations('raml.test');

    ramlFileOperations.createDirectoryStructure()
      .then(() => {
        done();
      })
      .catch(exception => {
        assert.equal(exception, 'Invalid directory path');
        done();
      })
  });

  it('should create directory structure', () => {
    let ramlFileOperations = new RamlFileOperations('raml.test');

    ramlFileOperations.createDirectoryStructure()
      .then(() => {
        Object.values(DIRECTORY_STRUCTURE.RAML_STRUCTURE).map(key => {
          fs.stat(path.join(ramlFileOperations.filePath, key), (err, stat) => {
            if (err) {
              assert.fail();
            }
            assert.equal(stat.isDirectory(), true);
          });
        })
      })
      .catch(exception => {
        assert.fail();
      })
  });

  it('should create raml type file', (done) => {
    let ramlFileOperations = new RamlFileOperations('raml.test');

    ramlFileOperations.createDirectoryStructure()
      .then(() => {
        return ramlFileOperations.generateSchemaTypeFiles([this.table]);
      })
      .then(() => {
        fs.readFile(
          path.join(ramlFileOperations.filePath, DIRECTORY_STRUCTURE.RAML_STRUCTURE.TYPES, (this.table.name + '.raml')), (err, data) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.equal(data, typesGenerator.generateTypeContent(this.table), 'Content should be the same');

            done();
          });
      })
      .catch(exception => {
        assert.fail();
        done();
      });
  });

  it('should create entity.json files', (done) => {
    let ramlFileOperations = new RamlFileOperations('raml.test');
    ramlFileOperations.createDirectoryStructure()
      .then(() => {
        return ramlFileOperations.generateSchemaExampleFiles(this.schema);
      })
      .then(() => {
        fs.readFile(
          path.join(ramlFileOperations.filePath, DIRECTORY_STRUCTURE.RAML_STRUCTURE.EXAMPLES, (Utils.toTitleCase(this.schema[0].name) + '.json')), (err, data) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.equal(Object.keys(JSON.parse(data)).length, this.schema[0].columns.length, 'Number of attributes should be the same');

            done();
          }
        )
      })
      .catch(exception => {
        assert.fail();
        done();
      })
  });

  it('should create entity[s].json files', (done) => {
    let ramlFileOperations = new RamlFileOperations('raml.test');

    ramlFileOperations.createDirectoryStructure()
      .then(() => {
        return ramlFileOperations.generateSchemaExampleFiles(this.schema);
      })
      .then(() => {
        return ramlFileOperations.generateSchemaExamplesFilesFromCache();
      })
      .then(() => {
        fs.readFile(
          path.join(ramlFileOperations.filePath, DIRECTORY_STRUCTURE.RAML_STRUCTURE.EXAMPLES, (Utils.pluralize(Utils.toTitleCase(this.schema[0].name)) + '.json')), (err, data) => {
            assert.ifError(err);
            assert(data, 'Countent should not be empty');
            assert.equal(JSON.parse(data).length, 2, 'Number of entities should be 2');

            for (const entity of JSON.parse(data)) {
              assert.equal(Object.keys(entity).length, 4, 'Number of attributes for every entity should be 4');
            }
          });

        done();
      })
      .catch(exception => {
        assert.fail();
        done();
      });
  });

  it('should create api.raml files', (done) => {
    let ramlFileOperations = new RamlFileOperations('raml.test');

    ramlFileOperations.generateSchemaApiFiles([{name: 'users'}], {name: 'Test Test', version: 'v1', url: '/'})
      .then(() => {
        fs.readFile(
          path.join(ramlFileOperations.filePath, 'api.raml'), (err, data) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            done();
          }
        )
      })
      .catch(exception => {
        assert.fail();
        done();
      })
  });

});