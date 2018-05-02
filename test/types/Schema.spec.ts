import * as assert from 'assert';
import Schema from '../../src/types/Schema';
import Table from '../../src/types/Table';
import Column from '../../src/types/Column';


describe('Schema Model', () => {
  it('should create an instance of Schema', () => {
    assert.equal((new Schema()) instanceof Schema, true);
  });

  it('should properly chain setters', () => {
    let instance = (new Schema())
      .setTables([new Table()]);
    assert.equal(instance.getTables().length, 1);
    assert.equal(instance.getTables()[0] instanceof Table, true);
  });

  it('should properly add a column to a table', () => {
    let instance = (new Schema())
      .setTables([(new Table()).setName('test')]);

    assert.equal(instance.getTables().length, 1);

    instance.addColumnToTable((new Column()).setName('column'), 'test');

    assert.equal(instance.getTables()[0].getColumns()[0] instanceof Column, true);
    assert.equal(instance.getTables()[0].getColumns()[0].getName(), 'column');

    instance.addColumnToTable((new Column()).setName('column'), 'not-a-test');

    assert.equal(instance.getTables()[0].getColumns().length, 1);
  });

  it('should properly remove a column by it\'s name', () => {
    let instance = (new Schema())
      .setTables([(new Table()).setName('test')]);

    assert.equal(instance.getTables().length, 1);

    instance.addColumnToTable((new Column()).setName('column'), 'test');

    assert.equal(instance.getTables()[0].getColumns()[0] instanceof Column, true);
    assert.equal(instance.getTables()[0].getColumns()[0].getName(), 'column');
    
    instance.removeColumnFromTable('column', 'not-a-test');

    assert.equal(instance.getTables()[0].getColumns().length, 1);

    instance.removeColumnFromTable('column', 'test');

    assert.equal(instance.getTables()[0].getColumns().length, 0);
  });
});
