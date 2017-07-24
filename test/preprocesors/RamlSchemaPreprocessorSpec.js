const RamlSchemaPreprocessor = require('../../src/preprocesors/RamlSchemaPreprocessor');
const assert = require('assert');
const preProcessor = new RamlSchemaPreprocessor();

describe('raml preprocesor test', () => {
  it('should convert array column to valid schema', () => {
    const colSchema = {
      name: 'users',
      displayName: 'users',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: [ 'array' ],
      required: false,
      items: 'User'
    };
    const processed = preProcessor.convertToStandardSchema(colSchema);
    assert.equal(processed.name, 'users');
    assert.equal(processed.primary, false);
    assert.equal(processed.allowNull, true);
    assert.equal(processed.unique, false);
    assert.equal(processed.dataType.type, 'User');
    assert.equal(processed.dataType.isArray, true);
  });

  it('should convert enum column to valid schema', () => {
    const colSchema = {
      name: 'active',
      displayName: 'active',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: [ 'Yes | No' ],
      required: false,
    };
    const processed = preProcessor.convertToStandardSchema(colSchema);
    assert.equal(processed.name, 'active');
    assert.equal(processed.primary, false);
    assert.equal(processed.allowNull, true);
    assert.equal(processed.unique, false);
    assert.equal(processed.dataType.type, 'enum');
    assert.equal(processed.dataType.isArray, false);
    assert.equal(processed.dataType.values.length, 2);
  });

  it('should convert ordinary column to valid schema', () => {
    const colSchema = {
      name: 'id',
      displayName: 'id',
      typePropertyKind: 'TYPE_EXPRESSION',
      type: [ 'number' ],
      required: true,
    };
    const processed = preProcessor.convertToStandardSchema(colSchema);
    assert.equal(processed.name, 'id');
    assert.equal(processed.primary, true);
    assert.equal(processed.allowNull, false);
    assert.equal(processed.unique, true);
    assert.equal(processed.dataType.type, 'number');
    assert.equal(processed.dataType.isArray, false);
  });
});