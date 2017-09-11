import RamlSchemaPreprocessor from '../../src/preprocesors/RamlSchemaPreprocessor';
import * as assert from 'assert';
import { RamlColumnSchema, Column } from '../../src/commons/types';
const preProcessor: RamlSchemaPreprocessor = new RamlSchemaPreprocessor();

describe('Suite for testing RamlPreProcessor class', () => {
  it('should convert array column to valid schema', () => {
    const colSchema: RamlColumnSchema = {
      name: 'users',
      displayName: 'users',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: [ 'array' ],
      required: false,
      items: 'User',
    };
    const processed: Column = preProcessor.convertToStandardSchema(colSchema);
    assert.equal(processed.name, 'users');
    assert.equal(processed.primary, false);
    assert.equal(processed.allowNull, true);
    assert.equal(processed.unique, false);
    assert.equal(processed.dataType.type, 'User');
    assert.equal(processed.dataType.isArray, true);
  });

  it('should convert enum column to valid schema', () => {
    const colSchema: RamlColumnSchema = {
      name: 'active',
      displayName: 'active',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: [ 'Yes | No' ],
      required: false,
      items: '',
    };
    const processed: Column = preProcessor.convertToStandardSchema(colSchema);
    assert.equal(processed.name, 'active');
    assert.equal(processed.primary, false);
    assert.equal(processed.allowNull, true);
    assert.equal(processed.unique, false);
    assert.equal(processed.dataType.type, 'enum');
    assert.equal(processed.dataType.isArray, false);
    if (processed.dataType.values) {
      assert.equal(processed.dataType.values.length, 2);
    } else {
      assert.fail('values not proceesed');
    }
  });

  it('should convert ordinary column to valid schema', () => {
    const colSchema: RamlColumnSchema = {
      name: 'id',
      displayName: 'id',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: [ 'number' ],
      required: true,
      items: '',
    };
    const processed: Column = preProcessor.convertToStandardSchema(colSchema);
    assert.equal(processed.name, 'id');
    assert.equal(processed.primary, true);
    assert.equal(processed.allowNull, false);
    assert.equal(processed.unique, true);
    assert.equal(processed.dataType.type, 'number');
    assert.equal(processed.dataType.isArray, false);
  });

  it('should cover empty type when converting to standard schema', () => {
    const colSchema: RamlColumnSchema = {
      name: 'id',
      displayName: 'id',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: [],
      required: true,
      items: '',
    };
    const processed: Column = preProcessor.convertToStandardSchema(colSchema);
    assert.equal(processed.name, 'id');
    assert.equal(processed.primary, true);
    assert.equal(processed.allowNull, false);
    assert.equal(processed.unique, true);
    assert.equal(processed.dataType.type, '');
    assert.equal(processed.dataType.isArray, false);
  });
});
