import RamlSchemaPreprocessor from '../../src/preprocesors/ramlSchemaPreprocessor';
import * as assert from 'assert';
import { RamlColumnSchema, Column } from '../../src/commons/types';
const preProcessor: RamlSchemaPreprocessor = new RamlSchemaPreprocessor();

describe('Suite for testing RamlPreProcessor class', () => {
  it('should convert array column to valid schema', () => {
    const colSchema: RamlColumnSchema = {
      name: 'users',
      displayName: 'users',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: ['array'],
      required: false,
      items: 'User',
    };
    const processed: Column = preProcessor.convertToStandardSchema(colSchema);
    assert.strictEqual(processed.name, 'users');
    assert.strictEqual(processed.primary, false);
    assert.strictEqual(processed.allowNull, true);
    assert.strictEqual(processed.unique, false);
    assert.strictEqual(processed.dataType.type, 'User');
    assert.strictEqual(processed.dataType.isArray, true);
  });

  it('should convert enum column to valid schema', () => {
    const colSchema: RamlColumnSchema = {
      name: 'active',
      displayName: 'active',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: ['Yes | No'],
      required: false,
      items: '',
    };
    const processed: Column = preProcessor.convertToStandardSchema(colSchema);
    assert.strictEqual(processed.name, 'active');
    assert.strictEqual(processed.primary, false);
    assert.strictEqual(processed.allowNull, true);
    assert.strictEqual(processed.unique, false);
    assert.strictEqual(processed.dataType.type, 'enum');
    assert.strictEqual(processed.dataType.isArray, false);
    if (processed.dataType.values) {
      assert.strictEqual(processed.dataType.values.length, 2);
    } else {
      assert.fail('values not proceesed');
    }
  });

  it('should convert ordinary column to valid schema', () => {
    const colSchema: RamlColumnSchema = {
      name: 'id',
      displayName: 'id',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: ['number'],
      required: true,
      items: '',
    };
    const processed: Column = preProcessor.convertToStandardSchema(colSchema);
    assert.strictEqual(processed.name, 'id');
    assert.strictEqual(processed.primary, true);
    assert.strictEqual(processed.allowNull, false);
    assert.strictEqual(processed.unique, true);
    assert.strictEqual(processed.dataType.type, 'number');
    assert.strictEqual(processed.dataType.isArray, false);
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
    assert.strictEqual(processed.name, 'id');
    assert.strictEqual(processed.primary, true);
    assert.strictEqual(processed.allowNull, false);
    assert.strictEqual(processed.unique, true);
    assert.strictEqual(processed.dataType.type, '');
    assert.strictEqual(processed.dataType.isArray, false);
  });
});
