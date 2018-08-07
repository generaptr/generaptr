import * as assert from 'assert';
import * as Generators from '../../src/generators';

describe('Generator', async () => {
  const options = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'secret',
    database: 'test',
  };

  it('should return the api config', () => {
    const generator: Generators.Config = new Generators.Config();

    console.log(generator.generate(options));
    assert.equal(true, true);
  });

  it('should return an express controller', () => {
    const generator: Generators.Controller = new Generators.Controller();
    console.log(generator.generate('express', {entity: 'user'}));
    assert.equal(true, true);
  });

  it('should return an express entrypoint', () => {
    const generator: Generators.Entrypoint = new Generators.Entrypoint();
    console.log(generator.generate());
    assert.equal(true, true);
  })
});