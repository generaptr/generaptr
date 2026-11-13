import * as assert from 'assert';
import SequelizeModelGenerator from '../../../../src/generators/api/models/sequelize';
import apiMocks from '../../../testUtils/apiMocks';
import schemaMocks from '../../../testUtils/schemaMocks';
import { Schema } from "../../../../src/commons/types";

const sequelizeModelGenerator: SequelizeModelGenerator = new SequelizeModelGenerator();

describe('Suite for testing the SequelizeModelGenerator class', () => {
  it('should generate a valid model registry', () => {
    assert.strictEqual(sequelizeModelGenerator.getModelsRegistry(), apiMocks.VALID_SEQUELIZE_MODEL_REGISTRY);
  });

  it('should generate a valid configuration file', () => {
    assert.strictEqual(sequelizeModelGenerator.getConfig(apiMocks.VALID_SEQUELIZE_CONFIG), apiMocks.VALID_SEQUELIZE_DATABASE_CONFIG);
  });

  it('should know how to generate valid models for a simple schema', () => {
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE);
    assert.strictEqual(models[0].name, 'User.js');
  });

  it('should know how to generate valid models for a schema with a one to one relation', () => {
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_ONE_TO_ONE as Schema);
    assert.strictEqual(models[0].name, 'Account.js');
    assert.strictEqual(models[1].name, 'User.js');
  });

  it('should know how to generate valid models for a schema with a one to many relation', () => {
    let models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_MANY_TO_ONE as Schema);
    assert.strictEqual(models[0].name, 'Account.js');
    assert.strictEqual(models[1].name, 'Application.js');

    models = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_ONE_TO_MANY as Schema);
    assert.strictEqual(models[0].name, 'Account.js');
    assert.strictEqual(models[1].name, 'Application.js');
  });

  it('should know how to generate valid models for a schema with a many to many relation', () => {
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_MANY_TO_MANY as Schema);
    assert.strictEqual(models[0].name, 'Group.js');
    assert.strictEqual(models[1].name, 'User.js');
  });

  it('should know how to generate valid models for a schema with enum field', () => {
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(schemaMocks.PROCESSED_SCHEMA_ONE_TABLE_WITH_ENUM as Schema);
    assert.strictEqual(models[0].name, 'User.js');
  });

  it('should not fail for unknown column type or relation', () => {
    const invalidSchema: Schema = [
      {
        name: 'users',
        columns: [
          {
            name: 'type',
            primary: false,
            unique: false,
            allowNull: false,
            dataType: {
              type: 'wrong-type',
            },
          },
          {
            name: 'relation',
            primary: false,
            unique: false,
            allowNull: false,
            dataType: {
              type: 'Account',
              relationType: undefined,
            },
          },
        ],
      },
    ];
    const models: {name: string; content: string}[] = sequelizeModelGenerator.getModels(invalidSchema);
    assert.strictEqual(models[0].name, 'User.js');
  });
});
