import * as assert from 'assert';
import RamlHandler from '../../../src/handlers/RamlHandler';
import { Schema } from '../../../src/commons/types';

describe('Suite for testing RamlHandler class', () => {

  it('should return an valid schema', (done: Function) => {
    try {
      const handler: RamlHandler = new RamlHandler({path: './test/handlers/raml/data/api.raml'});
      handler.parseSchema().then((schema: Schema) => {
        assert.equal(schema.length, 4);
        done();
      }).catch((err: Error) => {
        console.log(err);
        assert.fail(err.message);
      });
    } catch (e) {
      assert.fail(e);
      done();
    }
  });
});
