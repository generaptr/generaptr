import * as assert from 'assert';
import specGenerator from '../../../src/generators/spec/spec';

const VALID_HEADER: string =
`#%RAML 1.0
title: Test Title
version: v1
baseUri: /{version}
protocols: [HTTP, HTTPS]
`;
const VALID_DATA_TYPES: string =
`types:
  User: !include types/User.raml
`;
const VALID_GET_ALL: string =
`  get:
    description: Get a list of all users
    responses:
      200:
        body:
          application/json:
            type: User[]
            example: !include examples/Users.json
`;
const VALID_CREATE: string =
`  post:
    description: Create a user
    body:
      application/json:
        type: User
    responses:
      201:
        body:
          application/json:
            type: User
            example: !include examples/User.json
`;
const VALID_GET_ONE: string =
`    get:
      description: Get an instance of user based on it\'s id.
      responses:
        200:
          body:
            application/json:
              type: User
              example: !include examples/User.json
`;
const VALID_UPDATE: string =
`    put:
      description: Update an instance of user.
      body:
        application/json:
          type: User
      responses:
        200:
          body:
            application/json:
              type: User
              example: !include examples/User.json
`;
const VALID_DELETE: string =
`    delete:
      description: Delete an instance of user based on it\'s id.
      responses:
        204:
`;

describe('Suite for testing RamlSpecGeneratorr', () => {

  it('should generate a valid get all spec', () => {
    assert.equal(specGenerator.addGetAllSpec('  ', {name: 'users', columns: []}), VALID_GET_ALL);
  });

  it('should generate a valid create spec', () => {
    assert.equal(specGenerator.addCreateSpec('  ', {name: 'users', columns: []}), VALID_CREATE);
  });

  it('should generate a valid get one spec', () => {
    assert.equal(specGenerator.addGetOneSpec('  ', {name: 'users', columns: []}), VALID_GET_ONE);
  });

  it('should generate a valid update spec', () => {
    assert.equal(specGenerator.addUpdateSpec('  ', {name: 'users', columns: []}), VALID_UPDATE);
  });

  it('should generate a valid delete spec', () => {
    assert.equal(specGenerator.addDeleteSpec('  ', {name: 'users', columns: []}), VALID_DELETE);
  });

  it('should add the data types', () => {
    assert.equal(specGenerator.addDataTypes([{name: 'users', columns: []}]), VALID_DATA_TYPES);
  });

  it('should add the generic info', () => {
    assert.equal(
      specGenerator.addHeaderContent(
        {name: 'Test Title', version: 'v1', url: '/', output: ''},
      ),
      VALID_HEADER,
    );
  });
});
