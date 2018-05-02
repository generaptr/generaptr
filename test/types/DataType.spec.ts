import * as assert from 'assert';
import DataType from '../../src/types/DataType';

describe('DataType Model', () => {
  it('should create an instance of DataType', () => {
    assert.equal((new DataType()) instanceof DataType, true);
  });

  it('should properly chain setters', () => {
    let type = (new DataType())
      .setIsArray(true)
      .setType('Type')
      .setValues(['Yes', 'No']);
    assert.equal(type.isArray(), true);
    assert.equal(type.getType(), 'Type');
    assert.deepEqual(type.getValues(), ['Yes', 'No']);
  });
});
