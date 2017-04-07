const assert = require('assert');
const RamlContentGenerator = require('../../src/ramlGenerator/ramlContentGenerator');
const before = require('mocha').before;

describe('Raml content generator', () => {
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

  it('should create raml type content', () => {
    const expectedResponse = '#%RAML 1.0 DataType\n'
      + 'type: object\n'
      + 'properties:'
      + '\n  id: number'
      + '\n  firstName?: string\n';

    const typeContent = RamlContentGenerator.generateTypeContent(this.table);
    assert.equal(typeContent, expectedResponse);
  });
});