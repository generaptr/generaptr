import assert from 'node:assert';
import RamlHandler from '../../../src/handlers/ramlHandler';
import { Schema } from '../../../src/commons/types';

describe('Suite for testing RamlHandler class', () => {

  it('should return an valid schema', async () => {
    const handler: RamlHandler = new RamlHandler({ path: './test/handlers/raml/data/api.raml' });
    const schema: Schema = await handler.parseSchema();
    assert.strictEqual(schema.length, 4);
  });
  it('should throw an error if invalid schema', async () => {
    const handler: RamlHandler = new RamlHandler({ path: './index.js' });
    await assert.rejects(handler.parseSchema(), { message: 'Incorrect RAML file!' });
  });
});
