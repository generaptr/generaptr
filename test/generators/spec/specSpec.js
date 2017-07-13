const assert = require('assert');
const specGenerator = require('../../../src/generators/spec/spec');

const VALID_HEADER = '#%RAML 1.0\ntitle: Test Title\nversion: v1\nbaseUri: /{version}\nprotocols: [HTTP, HTTPS]\n';
const VALID_DATA_TYPES = 'types:\n  User: !include types/User.raml\n';
const VALID_GET_ALL = '  get:\n' +
  '    description: Get a list of all users\n' +
  '    responses:\n' +
  '      200:\n' +
  '        body:\n' +
  '          application/json:\n' +
  '            type: User[]\n' +
  '            example: !include examples/Users.json\n';
const VALID_CREATE = '  post:\n' +
  '    description: Create a user\n' +
  '    body:\n' +
  '      application/json:\n' +
  '        type: User\n' +
  '    responses:\n' +
  '      201:\n' +
  '        body:\n' +
  '          application/json:\n' +
  '            type: User\n' +
  '            example: !include examples/User.json\n';
const VALID_GET_ONE = '    get:\n' +
  '      description: Get an instance of user based on it\'s id.\n' +
  '      responses:\n' +
  '        200:\n' +
  '          body:\n' +
  '            application/json:\n' +
  '              type: User\n' +
  '              example: !include examples/User.json\n';
const VALID_UPDATE = '    put:\n' +
  '      description: Update an instance of user.\n' +
  '      body:\n' +
  '        application/json:\n' +
  '          type: User\n' +
  '      responses:\n' +
  '        200:\n' +
  '          body:\n' +
  '            application/json:\n' +
  '              type: User\n' +
  '              example: !include examples/User.json\n';
const VALID_DELETE = '    delete:\n' +
  '      description: Delete an instance of user based on it\'s id.\n' +
  '      responses:\n' +
  '        204:\n';

describe('Raml api spec generator', () => {

  it('should generate a valid get all spec', () => {
    assert.equal(specGenerator.addGetAllSpec('  ', {name: 'users'}), VALID_GET_ALL);
  });

  it('should generate a valid create spec', () => {
    assert.equal(specGenerator.addCreateSpec('  ', {name: 'users'}), VALID_CREATE);
  });

  it('should generate a valid get one spec', () => {
    assert.equal(specGenerator.addGetOneSpec('  ', {name: 'users'}), VALID_GET_ONE);
  });

  it('should generate a valid update spec', () => {
    assert.equal(specGenerator.addUpdateSpec('  ', {name: 'users'}), VALID_UPDATE);
  });

  it('should generate a valid delete spec', () => {
    assert.equal(specGenerator.addDeleteSpec('  ', {name: 'users'}), VALID_DELETE);
  });

  it('should add the data types', () => {
    assert.equal(specGenerator.addDataTypes([{name: 'users'}]), VALID_DATA_TYPES);
  });

  it('should add the generic info', () => {
    assert.equal(specGenerator.addHeaderContent({name: 'Test Title', version: 'v1', url: '/'}), VALID_HEADER);
  });

  it('should generate a valid spec for an entity', () => {
    const validSpec = '/users:\n' + VALID_GET_ALL + VALID_CREATE + '  /{userId}:\n' + VALID_GET_ONE + VALID_UPDATE + VALID_DELETE;
    assert.equal(specGenerator.addSpecForEntity({name: 'users'}), validSpec);
  });

  it('should generate a valid spec for schema', () => {
    const validSpec = VALID_HEADER + VALID_DATA_TYPES + '/users:\n' + VALID_GET_ALL + VALID_CREATE + '  /{userId}:\n' + VALID_GET_ONE + VALID_UPDATE + VALID_DELETE;
    assert.equal(specGenerator.generateContent([{name: 'users'}], {name: 'Test Title', version: 'v1', url: '/'}), validSpec);
  })
});