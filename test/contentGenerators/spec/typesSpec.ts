import * as assert from 'assert';
import typesGenerator from '../../../src/contentGenerators/spec/types';
import { Table } from '../../../src/commons/types';

const table: Table = {
  name: 'users',
  columns: [
    {
      name: 'id',
      allowNull: false,
      unique: true,
      primary: true,
      dataType: {
        type: 'number',
        size: undefined,
      },
    },
    {
      name: 'firstName',
      allowNull: true,
      unique: false,
      primary: false,
      dataType: {
        type: 'string',
        size: 45,
      },
    },
    {
      name: 'roles',
      allowNull: true,
      unique: false,
      primary: false,
      dataType: {
        type: 'Role',
        isArray: true,
      },
    },
  ],
};

const enumTable: Table = {
  name: 'users',
  columns: [
    {
      name: 'isActive',
      primary: false,
      allowNull: false,
      unique: false,
      dataType: {
        type: 'enum',
        isArray: false,
        values: ['No', 'Yes'],
      },
    },
  ],
};

describe('Suite for testing RamlTypesGenerator', () => {

  it('should create raml type content', () => {
    const expectedResponse: string =
`#%RAML 1.0 DataType
type: object
properties:
  id:
    required: true
    type: number
  firstName:
    required: false
    type: string
  roles:
    required: false
    type: Role[]
`;

    const typeContent: string = typesGenerator.generateTypeContent(table);

    assert.equal(typeContent, expectedResponse);
  });

  it ('should create raml type content for enum', () => {
    const expectedResponse: string =
`#%RAML 1.0 DataType
type: object
properties:
  isActive:
    required: true
    type: No | Yes
`;

    const typeContent: string = typesGenerator.generateTypeContent(enumTable);
    assert.equal(typeContent, expectedResponse);
  });
});
