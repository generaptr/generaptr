import * as assert from 'assert';
import ForeignKey from '../../src/types/ForeignKey';
import Column from '../../src/types/Column';
import DataType from '../../src/types/DataType';

describe('Column Model', () => {
  it('should create an instance of Column', () => {
    assert.equal((new Column()) instanceof Column, true);
  });

  it('should properly chain setters', () => {
    let instance = (new Column())
      .setForeignKey(new ForeignKey())
      .setName('test')
      .setNullable(false)
      .setPrimary(true)
      .setUnique(true)
      .setType(new DataType());
    assert.equal(instance.getForeignKey() instanceof ForeignKey, true);
    assert.equal(instance.getType() instanceof DataType, true);
    assert.equal(instance.getName(), 'test');
    assert.equal(instance.isPrimary(), true);
    assert.equal(instance.isNullable(), false);
    assert.equal(instance.isUnique(), true);
  });
});
