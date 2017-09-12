import * as assert from 'assert';
import SequelizeModelGenerator from '../../../../src/generators/api/models/sequelize';
import apiMocks from '../../../testUtils/apiMocks';
import schemaMocks from '../../../testUtils/schemaMocks';
import { Schema } from "../../../../src/commons/types";

const sequelizeModelGenerator: SequelizeModelGenerator = new SequelizeModelGenerator();

describe('Suite for testing the SequelizeModelGenerator class', () => {
  it('should generate a valid model registry', () => {
    assert.equal(sequelizeModelGenerator.getModelsRegistry(), apiMocks.VALID_SEQUELIZE_MODEL_REGISTRY);
  });

  it('should generate a valid configuration file', () => {
    assert.equal(sequelizeModelGenerator.getConfig(apiMocks.VALID_SEQUELIZE_CONFIG), apiMocks.VALID_SEQUELIZE_DATABASE_CONFIG);
  });

  it('should know how to generate valid models for a simple schema', () => {
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);
    assert.equal(models[0].name, 'User.js');
  });

  it('should know how to generate valid models for a schema with a one to one relation', () => {
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_ONE_TO_ONE as Schema);
    assert.equal(models[0].name, 'Account.js');
    assert.equal(models[1].name, 'User.js');
  });

  it('should know how to generate valid models for a schema with a one to many relation', () => {
    let models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_MANY_TO_ONE as Schema);
    assert.equal(models[0].name, 'Account.js');
    assert.equal(models[1].name, 'Application.js');

    models = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_ONE_TO_MANY as Schema);
    assert.equal(models[0].name, 'Account.js');
    assert.equal(models[1].name, 'Application.js');
  });

  it('should know how to generate valid models for a schema with a many to many relation', () => {
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_MANY_TO_MANY as Schema);
    assert.equal(models[0].name, 'Group.js');
    assert.equal(models[1].name, 'User.js');
  });

  it('should know how to generate valid models for a schema with enum field', () => {
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE_WITH_ENUM as Schema);
    assert.equal(models[0].name, 'User.js');
  });
});
