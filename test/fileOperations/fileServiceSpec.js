const assert = require('assert');
const before = require('mocha').before;
const fs = require('fs');
const path = require('path');

const FileService = require('../../src/services/fileService');
const DIRECTORY_STRUCTURE = require('../../src/commons/constants/directoryStructure');
const RamlContentGenerator = require('../../src/ramlGenerator/ramlContentGenerator');
const Utils = require('../../src/commons/utils/utils');

describe('File operation service', () => {
  before(() => {
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
  });

  it('should throw an error if path is not provided', () => {
    try {
      new FileService();
    } catch (exception) {
      assert.equal('FilePath not provided', exception.message);
    }
  });

  it('should throw an error if path provided is filePath', (done) => {
    let fileService = new FileService('test.txt');

    fileService.createDirectoryStructure()
      .then(() => {
        done();
      })
      .catch(exception => {
        assert.equal(exception, 'Invalid directory path');
        done();
      })
  });

  it('should create directory structure', () => {
    let fileService = new FileService('raml');

    fileService.createDirectoryStructure()
      .then(() => {
        Object.values(DIRECTORY_STRUCTURE).map(key => {
          fs.stat(path.join(fileService.filePath, key), (err, stat) => {
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
    let fileService = new FileService('raml');

    fileService.createDirectoryStructure()
      .then(() => {
        return fileService.generateTypeFiles([this.table]);
      })
      .then(() => {
        fs.readFile(
          path.join(fileService.filePath, DIRECTORY_STRUCTURE.TYPES, (this.table.name + '.raml')), (err, data) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.equal(data, RamlContentGenerator.generateTypeContent(this.table), 'Content should be the same');

            done();
          });
      })
      .catch(exception => {
        assert.fail();
        done();
      });
  });
});