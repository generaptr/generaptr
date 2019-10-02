import * as assert from 'assert';
import BaseHandler from '../../src/handlers/BaseHandler';
import { MySqlColumnSchema } from '../../src/commons/types';

const handler: BaseHandler = new BaseHandler('');

const colSchema: MySqlColumnSchema = {
  COLUMN_NAME: 'test',
  COLUMN_TYPE: '',
  COLUMN_KEY: 'PRI',
  IS_NULLABLE: 'NO',
  DATA_TYPE: 'varchar',
  CHARACTER_MAXIMUM_LENGTH: '255',
};

describe('Suite for testing BaseHandler class', () => {
  it('should throw an error for unknown driver when normalizing column schema', () => {
    try {
      handler.normalizeColumnSchema(colSchema);
    } catch (e) {
      assert.strictEqual(e.message, 'Input source not not supported.');
    }
  });

  it('should throw an error for unknown driver when normalizing db schema', () => {
    try {
      handler.normalizeRelations([{ name: 'users', columns: [] }]);
    } catch (e) {
      assert.strictEqual(e.message, 'Input source not not supported.');
    }
  });
});
