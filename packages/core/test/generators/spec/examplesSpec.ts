import assert from 'node:assert';
import mocks from '../../testUtils/schemaMocks';
import examplesGenerator from '../../../src/generators/spec/examples';
import { Example, Schema, Table } from '../../../src/commons/types';

describe('Suite for testing RamlExampleGenerator', () => {

  it('should return js entity object for a simple table', () => {
    const groupExample: Example = examplesGenerator.generateTypeExampleContent(
      mocks.PROCESSED_SCHEMA_MANY_TO_MANY as Schema,
      mocks.PROCESSED_SCHEMA_MANY_TO_MANY[0] as Table,
      0,
    );

    assert(groupExample, 'Object should not be null');
    assert(groupExample.type, 'Type should not be null');
    assert.strictEqual(groupExample.type, 'Group', 'Type object should be User');
    assert(groupExample.data, 'Data object should not be null');
    assert.strictEqual(Object.keys(groupExample.data).length, 3, 'Number of data generated should be 3');

    const userExample: Example = examplesGenerator.generateTypeExampleContent(
      mocks.PROCESSED_SCHEMA_MANY_TO_MANY as Schema,
      mocks.PROCESSED_SCHEMA_MANY_TO_MANY[1] as Table,
      0,
    );

    assert(userExample, 'Object should not be null');
    assert(userExample.type, 'Type should not be null');
    assert.strictEqual(userExample.type, 'User', 'Type object should be User');
    assert(userExample.data, 'Data object should not be null');
    // users mock has 5 columns; mocha saw 4 only because an earlier spec cached a 4-column User.
    assert.strictEqual(Object.keys(userExample.data).length, 5, 'Number of data generated should be 5');
  });
});
