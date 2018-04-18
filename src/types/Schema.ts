import Table from './Table';
import Column from './Column';

/**
 * Schema type class.
 *
 * @namespace types
 * @class Schema
 */
export default class Schema {
  /**
   * Holds the array of tables.
   *
   * @property {Table[]} tables - array of tables
   */
  private tables: Table[];

  /**
   * Getter for the `tables` property.
   *
   * @memberOf Table
   * @returns {Table[]} - array of tables
   */
  public getTables(): Table[] {
    return this.tables;
  }

  /**
   * Setter for the `tables` property.
   *
   * @memberOf Table
   * @param {Table[]} tables - array of tables
   * @returns {Schema} - instance of Schema
   */
  public setTables(tables: Table[]): Schema {
    this.tables = tables;

    return this;
  }

  /**
   * Add a column to a given table.
   * 
   * @param column - column to be added.
   * @param tableName - table in which the column is getting added.
   */
  public addColumnToTable(column: Column, tableName: string): Schema {
    this.tables = this.tables.map((table: Table) => {
      if (table.getName() === tableName) {
        table.addColumn(column);
      }

      return table;
    });

    return this;
  }

  /**
   * Remove a column to a given table.
   * 
   * @param column - column to be removed.
   * @param tableName - table in which the column is getting removed.
   */
  public removeColumnFromTable(column: string, tableName: string): Schema {
    this.tables = this.tables.map((table: Table) => {
      if (table.getName() === tableName) {
        table.removeColumn(column);
      }

      return table;
    });

    return this;
  }
}
