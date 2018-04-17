import DataType from './DataType';
import ForeignKey from './ForeignKey';

/**
 * Column type class.
 *
 * @namespace types
 * @class Column
 */
export default class Column {
  /**
   * Holds the column name.
   *
   * @property {string} name - column name
   */
  private name: string;

  /**
   * Flag which describes the column's unique state.
   *
   * @property {boolean} unique - unique flag
   */
  private unique: boolean;

  /**
   * Flag which describes the column's primary state.
   *
   * @property {boolean} primary - primary flag
   */
  private primary: boolean;

  /**
   * Flag which describes the column's nullable state.
   *
   * @property {boolean} nullable - nullable flag
   */
  private nullable: boolean;

  /**
   * Holds information regarding the foreign key if one exists.
   *
   * @property {?ForeignKey} foreignKey - foreign key
   */
  private foreignKey?: ForeignKey;

  /**
   * Holds information regarding the column's data type.
   *
   * @property {DataType} type - data type
   */
  private type: DataType;

  /**
   * Getter for the `name` property.
   *
   * @memberOf Column
   * @returns {string} -  column name
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Setter for the `name` property.
   *
   * @memberOf Column
   * @param {string} name - column name
   * @returns {Column} - instance of Column
   */
  public setName(name: string): Column {
    this.name = name;

    return this;
  }

  /**
   * Getter for the `unique` property.
   *
   * @memberOf Column
   * @returns {boolean} - unique flag
   */
  public isUnique(): boolean {
    return this.unique;
  }

  /**
   * Setter for the `unique` property.
   *
   * @memberOf Column
   * @param {boolean} unique  - unique flag
   * @returns {Column} - instance of Column
   */
  public setUnique(unique: boolean): Column {
    this.unique = unique;

    return this;
  }

  /**
   * Getter for the `primary` property.
   *
   * @memberOf Column
   * @returns {boolean} - primary flag
   */
  public isPrimary(): boolean {
    return this.primary;
  }

  /**
   * Setter for the `primary` property.
   *
   * @memberOf Column
   * @param {boolean} primary - primary flag
   * @returns {Column} - instance of Column
   */
  public setPrimary(primary: boolean): Column {
    this.primary = primary;

    return this;
  }

  /**
   * Getter for the `nullable` property.
   *
   * @memberOf Column
   * @returns {boolean} - nullable flag
   */
  public isNullable(): boolean {
    return this.nullable;
  }

  /**
   * Setter for the `nullable` property.
   *
   * @memberOf Column
   * @param {boolean} nullable - nullable flag
   * @returns {Column} - instance of Column
   */
  public setNullable(nullable: boolean): Column {
    this.nullable = nullable;

    return this;
  }

  /**
   * Getter for the `foreignKey` property.
   *
   * @memberOf Column
   * @returns {?ForeignKey | undefined} - foreign key
   */
  public getForeignKey(): ForeignKey | undefined {
    return this.foreignKey;
  }

  /**
   * Setter for the `foreignKey` property.
   *
   * @memberOf Column
   * @param {ForeignKey} foreignKey - instance of ForeignKey
   * @returns {Column} - instance of Column
   */
  public setForeignKey(foreignKey: ForeignKey): Column {
    this.foreignKey = foreignKey;

    return this;
  }

  /**
   * Getter for the `type` property.
   *
   * @memberOf Column
   * @returns {DataType} - data type
   */
  public getType(): DataType {
    return this.type;
  }

  /**
   * Setter for the `type` property.
   *
   * @memberOf Column
   * @param {DataType} type - instance of DataType
   * @returns {Column} - instance of Column
   */
  public setType(type: DataType): Column {
    this.type = type;

    return this;
  }
}
