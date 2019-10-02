import * as assert from 'assert';
import SequelizeRepositoryGenerator from '../../../../src/generators/api/repositories/sequelize';
import schemaMocks from '../../../testUtils/schemaMocks';
import { Schema } from "../../../../src/commons/types";

const sequelizeRepositoryGenerator: SequelizeRepositoryGenerator = new SequelizeRepositoryGenerator();

describe('Suite for testing the SequelizeRepositoryGenerator class', () => {
  it('should know how to generate valid repositories from a given schema', () => {
    const generated: {name: string; content: string}[] = sequelizeRepositoryGenerator.getRepositories(schemaMocks.PROCESSED_SCHEMA_ONE_TO_ONE as Schema);
    assert.strictEqual(generated[0].name, 'AccountRepository.js');
    assert.strictEqual(generated[1].name, 'UserRepository.js');
  });

  it('should generate a valid repository factory', () => {
    const generated: {name: string; content: string} = sequelizeRepositoryGenerator.getRepositoryFactory(schemaMocks.PROCESSED_SCHEMA_ONE_TO_ONE as Schema);
    assert.strictEqual(generated.name, 'repositoryFactory.js');
    assert.strictEqual(generated.content.length > 0, true);
  });
});
