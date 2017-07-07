const MysqlSchemaPreprocessor = require('../../src/preprocesors/MysqlSchemaPreprocessor');
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
    assert.equal(processed.name, 'test');
    assert.equal(processed.primary, true);
    assert.equal(processed.allowNull, false);
    assert.equal(processed.foreignKey, false);
    assert.equal(processed.unique, true);
    assert.equal(processed.dataType.type, 'string');
    assert.equal(processed.dataType.size, 255);

    colSchema.COLUMN_NAME = null;
    assert.equal(preProcessor.convertToStandardSchema(colSchema).name, null);
  });

  it('should clean up table schema', () => {
    const valid = mocks.PROCESSED_SCHEMA_ONE_TABLE[0];
    const processed = preProcessor.normalizeSchemaRelations(mocks.SCHEMA_ONE_TABLE).pop();
    assert.equal(processed.name, valid.name);
    assert.equal(processed.columns.length, valid.columns.length);
  });

  it('should normalize one to one relations', () => {
    const validAccounts = mocks.PROCESSED_SCHEMA_ONE_TO_ONE[0];
    const validUsers = mocks.PROCESSED_SCHEMA_ONE_TO_ONE[1];
    const processed = preProcessor.normalizeSchemaRelations(mocks.SCHEMA_ONE_TO_ONE);
    const processedAccounts = processed[0];
    const processedUsers = processed[1];

    assert.equal(processedAccounts.name, validAccounts.name);
    assert.equal(processedAccounts.columns.length, validAccounts.columns.length);
    assert.equal(processedUsers.name, validUsers.name);
    assert.equal(processedUsers.columns.length, validUsers.columns.length);
  });

  it('should normalize many to one relations', () => {
    const validAccounts = mocks.PROCESSED_SCHEMA_MANY_TO_ONE[0];
    const validApplications = mocks.PROCESSED_SCHEMA_MANY_TO_ONE[1];
    const processed = preProcessor.normalizeSchemaRelations(mocks.SCHEMA_MANY_TO_ONE);
    const processedAccounts = processed[0];
    const processedApplications = processed[1];

    assert.equal(processedAccounts.name, validAccounts.name);
    assert.equal(processedAccounts.columns.length, validAccounts.columns.length);
    assert.equal(processedApplications.name, validApplications.name);
    assert.equal(processedApplications.columns.length, validApplications.columns.length);
  });

  it('should normalize many to many relations', () => {
    const validGroups = mocks.PROCESSED_SCHEMA_MANY_TO_MANY[0];
    const validUsers = mocks.PROCESSED_SCHEMA_MANY_TO_MANY[1];
    const processed = preProcessor.normalizeSchemaRelations(mocks.SCHEMA_MANY_TO_MANY);
    const processedGroups = processed[0];
    const processedUsers = processed[1];

    assert.equal(processedGroups.name, validGroups.name);
    assert.equal(processedGroups.columns.length, validGroups.columns.length);
    assert.equal(processedUsers.name, validUsers.name);
    assert.equal(processedUsers.columns.length, validUsers.columns.length);
  });
  
});