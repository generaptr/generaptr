import * as assert from 'assert';
import schemaUtil from '../../src/commons/utils/schemaUtil';
import mocks from '../testUtils/schemaMocks';
import { Table, Column, Schema } from '../../src/commons/types';

describe('Suite for testing SchemaUtil class', () => {

  it('should get normalized table by type', () => {
    const table: Table | undefined = schemaUtil.getNormalizedTableByType([{ name: 'users', columns: [] }], 'User');
    if (!table) {
      assert.fail('table not found in schema.');
    } else {
      assert.strictEqual(table.name, 'users');
    }
  });

  it('should return false if nothing found', () => {
    const table: Table | undefined = schemaUtil.getNormalizedTableByType([{ name: 'users', columns: [] }], 'Account');
    assert.strictEqual(table, undefined);
  });

  it('should know how to convert enum values', () => {
    assert.strictEqual(
      Number(schemaUtil.convertValues(
        {
          name: '',
          primary: false,
          unique: false,
          allowNull: true,
          dataType: {
            type: 'enum',
            rawValues: '',
          },
        },
      ).dataType.values),
      0,
    );
  });

  it('should convert raml values', () => {
    const values: string[] = ['Yes', 'No'];

    const ramlValues: string = schemaUtil.valuesToRamlDataType(values);
    assert(ramlValues);
    assert.strictEqual(ramlValues.length, 8);
    assert.strictEqual(ramlValues, 'Yes | No');
    assert.strictEqual(schemaUtil.valuesToRamlDataType([]), '');
  });

  it('should detect if relation is circular', () => {
    assert.strictEqual(
      schemaUtil.isCircularRelation(
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0] as Table,
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0].columns[2] as Column,
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE as Schema,
      ),
      true,
    );
    assert.strictEqual(
      schemaUtil.isCircularRelation(
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0] as Table,
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0].columns[1] as Column,
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE as Schema,
      ),
      false,
    );
  });

  it('should detect if refferenced column is required', () => {
    assert.strictEqual(
      schemaUtil.circularRelationIsRequired(
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE[1] as Table,
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE[1].columns[4] as Column,
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE as Schema,
      ),
      true,
    );
    assert.strictEqual(
      schemaUtil.circularRelationIsRequired(
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0] as Table,
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0].columns[1] as Column,
        mocks.PROCESSED_SCHEMA_ONE_TO_ONE as Schema,
      ),
      false,
    );
  });

  it('should detect if refferenced column is array', () => {
    assert.strictEqual(
      schemaUtil.circularRelationIsArray(
        mocks.PROCESSED_SCHEMA_MANY_TO_ONE[1] as Table,
        mocks.PROCESSED_SCHEMA_MANY_TO_ONE[1].columns[2] as Column,
        mocks.PROCESSED_SCHEMA_MANY_TO_ONE as Schema,
      ),
      true,
    );
    assert.strictEqual(
      schemaUtil.circularRelationIsArray(
        mocks.PROCESSED_SCHEMA_MANY_TO_ONE[0] as Table,
        mocks.PROCESSED_SCHEMA_MANY_TO_ONE[0].columns[1] as Column,
        mocks.PROCESSED_SCHEMA_MANY_TO_ONE as Schema,
      ),
      false,
    );
  });

  it('should get related Tables for a given Table', () => {
    const related: Column[] = schemaUtil.getRelatedTablesForTable(mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0] as Table);
    assert.strictEqual(related.length, 1);
    assert.strictEqual(related[0].dataType.type, 'User');
  });
});
