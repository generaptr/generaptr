const assert = require('assert');
const RamlHandler = require('../../../src/handlers/RamlHandler');

describe('RAML handler', () => {
  it('should throw an error if no path was passed', () => {
    try {
      new RamlHandler({});
    }  catch (e) {
      assert.equal(e.message, 'Path is a required argument.');
    }
  });

  it('should create a valid handler', () => {
    try {
      const handler = new RamlHandler({path: './test/handlers/raml/data/api.raml'});
      assert.equal(handler.path, './test/handlers/raml/data/api.raml');
    } catch (e) {
      assert.fail();
    }
  });

  it('should return an valid schema', (done) => {
    try {
      const handler = new RamlHandler({path: './test/handlers/raml/data/api.raml'});
      handler.parseSchema().then(tables => {
        assert.equal(tables.length, 4);
        done();
      }).catch(err => {
        console.log(err);
        assert.fail();
      });
    } catch (e) {
      assert.fail(e);
      done();
    }
  });
});
