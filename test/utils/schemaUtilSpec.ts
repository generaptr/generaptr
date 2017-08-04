import * as assert from 'assert';
import schemaUtil from '../../src/commons/utils/schemaUtil';
import { Table } from '../../src/commons/types';

describe('Suite for testing SchemaUtil class', () => {

  it('should get normalized table by type', () => {
    const table: Table | undefined = schemaUtil.getNormalizedTableByType([{name: 'users', columns: []}], 'User');
    if (!table) {
      assert.fail('table not found in schema.');
    } else {
      assert.equal(table.name, 'users');
    }
  });

  it('should return false if nothing found', () => {
    const table: Table | undefined = schemaUtil.getNormalizedTableByType([{name: 'users', columns: []}], 'Account');
    assert.equal(table, undefined);
  });

  it('should convert raml values', () => {
    const values: string[] = ['Yes', 'No'];

    const ramlValues: string = schemaUtil.valuesToRamlDataType(values);
    assert(ramlValues);
    assert.equal(ramlValues.length, 8);
    assert.equal(ramlValues, 'Yes | No');
  });
});
