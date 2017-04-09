const MysqlSchemaPreprocessor = require('../../src/commons/preprocesors/MysqlSchemaPreprocessor');
const assert = require('assert');
const mocks = require('../testUtils/mocks');
const preProcessor = new MysqlSchemaPreprocessor();

describe('mysql preprocesor test', () => {
  it('should convert a valid column schema to standard schema', () => {
    const colSchema = {
      'COLUMN_NAME': 'test',
      'COLUMN_KEY': 'PRI',
      'IS_NULLABLE': 'NO',
      'DATA_TYPE': 'varchar',
      'CHARACTER_MAXIMUM_LENGTH': '255'
    };
    const processed = preProcessor.convertToStandardSchema(colSchema);
    assert.equal('test', processed.name);
    assert.equal(true, processed.primary);
    assert.equal(false, processed.allowNull);
    assert.equal(false, processed.foreignKey);
    assert.equal(true, processed.unique);
    assert.equal('string', processed.dataType.type);
    assert.equal(255, processed.dataType.size);

    colSchema.COLUMN_NAME = null;
    assert.equal(null, preProcessor.convertToStandardSchema(colSchema).name);
  });

  it('should clean up table schema', () => {
    const valid = mocks.PROCESSED_SCHEMA_ONE_TABLE[0];
    const processed = preProcessor.normalizeSchemaRelations(mocks.SCHEMA_ONE_TABLE).pop();
    assert.equal(valid.name, processed.name);
    assert.equal(valid.columns.length, processed.columns.length);
  });

  it('should normalize one to one relations', () => {
    const validAccounts = mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0];
    const validUsers = mocks.PROCESSED_SCHEMA_ONE_TO_ONE[1];
    const processed = preProcessor.normalizeSchemaRelations(mocks.SCHEMA_ONE_TO_ONE);
    const processedAccounts = processed[0];
    const processedUsers = processed[1];

    assert.equal(validAccounts.name, processedAccounts.name);
    assert.equal(validAccounts.columns.length, processedAccounts.columns.length);
    assert.equal(validUsers.name, processedUsers.name);
    assert.equal(validUsers.columns.length, processedUsers.columns.length);
  });

  it('should normalize many to one relations', () => {
    const validAccounts = mocks.PROCESSED_SCHEMA_MANY_TO_ONE[0];
    const validApplications = mocks.PROCESSED_SCHEMA_MANY_TO_ONE[1];
    const processed = preProcessor.normalizeSchemaRelations(mocks.SCHEMA_MANY_TO_ONE);
    const processedAccounts = processed[0];
    const processedApplications = processed[1];

    assert.equal(validAccounts.name, processedAccounts.name);
    assert.equal(validAccounts.columns.length, processedAccounts.columns.length);
    assert.equal(validApplications.name, processedApplications.name);
    assert.equal(validApplications.columns.length, processedApplications.columns.length);
  });

  it('should normalize many to many relations', () => {
    const validGroups = mocks.PROCESSED_SCHEMA_MANY_TO_MANY[0];
    const validUsers = mocks.PROCESSED_SCHEMA_MANY_TO_MANY[1];
    const processed = preProcessor.normalizeSchemaRelations(mocks.SCHEMA_MANY_TO_MANY);
    const processedGroups = processed[0];
    const processedUsers = processed[1];

    assert.equal(validGroups.name, processedGroups.name);
    assert.equal(validGroups.columns.length, processedGroups.columns.length);
    assert.equal(validUsers.name, processedUsers.name);
    assert.equal(validUsers.columns.length, processedUsers.columns.length);
  });
  
});