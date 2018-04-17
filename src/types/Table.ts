import Column from './Column';

/**
 * Table type class.
 *
 * @namespace types
 * @class Table
 */
export default class Table {
  /**
   * Holds the table name.
   *
   * @property {string} name - table name
   */
  private name: string;

  /**
   * Holds the array of columns.
   *
   * @property {Column[]} name - array of columns
   */
  private columns: Column[];


  /**
   * Holds the cross reference boolean.
   * 
   * @property {boolean} crossReference - true if table is many to many cross reference
   */
  private crossReference: boolean;

  /**
   * Represents if any of the colums is a foreign key.
   * 
   * @property {boolean} foreignKeys - true if any of the columns is a foreign key
   */
  private foreignKeys: boolean;

  /**
   * Getter for the `name` property.
   *
   * @memberOf Table
   * @returns {string} -  table name
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Setter for the `name` property.
   *
   * @memberOf Table
   * @param {string} name - table name
   * @returns {Table} - instance of Table
   */
  public setName(name: string): Table {
    this.name = name;

    return this;
  }

  /**
   * Getter for the `columns` property.
   *
   * @memberOf Table
   * @returns {Column[]} -  array of columns
   */
  public getColumns(): Column[] {
    return this.columns;
  }

  /**
   * Setter for the `columns` property.
   *
   * @memberOf Table
   * @param {Column[]} columns - array of columns
   * @returns {Table} - instance of Table
   */
  public setColumns(columns: Column[]): Table {
    this.columns = columns;

    return this;
  }

  /**
   * Getter for `corssReference` property.
   * 
   * @returns {boolean} - cross reference value
   */
  public isCrossReference(): boolean {
    return this.crossReference;
  }

  /**
   * Setter for `crossReference` property.
   * 
   * @param {boolean} crossReference - value
   * @returns {Table} - instance of table
   */
  public setCrossReference(crossReference: boolean): Table {
    this.crossReference = crossReference;

    return this;
  }

  /**
   * Getter for `foreignKeys` property.
   * 
   * @returns {boolean} - foreign keys value
   */
  public hasForeignKeys(): boolean {
    return this.foreignKeys;
  }

   /**
   * Setter for `foreignKeys` property.
   * 
   * @param {boolean} foreignKeys - value
   * @returns {Table} - instance of table
   */
  public setForeignKeys(foreignKeys: boolean): Table {
    this.foreignKeys = foreignKeys;

    return this;
  }
}
