import Table from './Table';

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
}
