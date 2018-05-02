import * as assert from 'assert';
import ForeignKey from '../../src/types/ForeignKey';

describe('ForeignKey Model', () => {
  it('should create an instance of ForeignKey', () => {
    assert.equal((new ForeignKey()) instanceof ForeignKey, true);
  });

  it('should properly chain setters', () => {
    let instance = (new ForeignKey())
      .setAlias(false)
      .setOwned(true)
      .setSource({table: 'table', column: 'column'})
      .setTarget({table: 'another-table', column: 'another-column'})
      .setType('n-n');
    assert.equal(instance.isAlias(), false);
    assert.equal(instance.isOwned(), true);
    assert.deepEqual(instance.getSource(), {table: 'table', column: 'column'});
    assert.deepEqual(instance.getTarget(), {table: 'another-table', column: 'another-column'});
    assert.equal(instance.getType(), 'n-n');
  });
});
