const assert = require('assert');
const typesGenerator = require('../../../src/generators/spec/types');
const before = require('mocha').before;

describe('Raml data types generator', () => {
  before(() => {

    // table mock
    this.table = {
      name: 'users',
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
        },
        {
          name: 'roles',
          allowNull: true,
          dataType: {
            type: 'Role',
            isArray: true
          },
        }
      ]
    };

    this.enumTable = {
      name: 'users',
      columns: [
        {
          name: 'isActive',
          allowNull: false,
          dataType: {
            type: 'enum',
            isArray: false,
            values: ['No', 'Yes']
          }
        }
      ]
    }
  });

  it('should create raml type content', () => {
    const expectedResponse = '#%RAML 1.0 DataType\n'
      + 'type: object\n'
      + 'properties:'
      + '\n  id:'
      + '\n    required: true'
      + '\n    type: number'
      + '\n  firstName:'
      + '\n    required: false'
      + '\n    type: string'
      + '\n  roles:'
      + '\n    required: false'
      + `\n    type: Role[]\n`;

    const typeContent = typesGenerator.generateTypeContent(this.table);

    assert.equal(typeContent, expectedResponse);
  });

  it ('should create raml type content for enum', () => {
    const expectedResponse = '#%RAML 1.0 DataType\n'
    + 'type: object\n'
    + 'properties:'
    + '\n  isActive:'
    + '\n    required: true'
    + '\n    type: No | Yes\n'

    const typeContent = typesGenerator.generateTypeContent(this.enumTable);
    assert.equal(typeContent, expectedResponse);
  });
});