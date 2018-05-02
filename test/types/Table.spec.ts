import * as assert from 'assert';
import Table from '../../src/types/Table';
import Column from '../../src/types/Column';

describe('Table Model', () => {
  it('should create an instance of Table', () => {
    assert.equal((new Table()) instanceof Table, true);
  });

  it('should properly chain setters', () => {
    let instance = (new Table())
      .setName('test')
      .setColumns([new Column()])
      .setCrossReference(true)
      .setForeignKeys(true);
    assert.equal(instance.getColumns().length, 1);
    assert.equal(instance.getColumns()[0] instanceof Column, true);
    assert.equal(instance.getName(), 'test');
    assert.equal(instance.isCrossReference(), true);
    assert.equal(instance.hasForeignKeys(), true);
  });

  it('should properly add a column', () => {
    let instance = new Table();

    assert.equal(instance.getColumns().length, 0);

    instance.addColumn((new Column()).setName('test'));

    assert.equal(instance.getColumns()[0] instanceof Column, true);
    assert.equal(instance.getColumns()[0].getName(), 'test');
  });

  it('should properly remove a column by it\'s name', () => {
    let instance = new Table();

    assert.equal(instance.getColumns().length, 0);

    instance.addColumn((new Column()).setName('test'));

    assert.equal(instance.getColumns()[0] instanceof Column, true);
    assert.equal(instance.getColumns()[0].getName(), 'test');

    instance.removeColumn('test');
    
    assert.equal(instance.getColumns().length, 0);
  });
});
