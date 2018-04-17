/**
 * Data Type type class.
 *
 * @namespace types
 * @class DataType
 */
export default class DataType {
  /**
   * Holds the type property.
   *
   * @property {string} type - data type
   */
  private type: string;

  /**
   * Flag which describes if the type referres to an array.
   *
   * @property {boolean} array - flag
   */
  private array: boolean;

  /**
   * Holds values if type is enum.
   *
   * @property {string[]} values - array of values
   */
  private values: string[] = [];

  /**
   * Getter for the `type` property.
   *
   * @memberOf DataType
   * @returns {string} - data type
   */
  public getType(): string {
    return this.type;
  }

  /**
   * Setter for the `type` property.
   *
   * @memberOf DataType
   * @param {string} type - data type
   * @returns {DataType} - instance of DataType
   */
  public setType(type: string): DataType {
    this.type = type;

    return this;
  }

  /**
   * Getter for the `array` property.
   *
   * @memberOf DataType
   * @returns {string} - array
   */
  public isArray(): boolean {
    return this.array;
  }

  /**
   * Setter for the `array` property.
   *
   * @memberOf DataType
   * @param {boolean} isArray - array flag
   * @returns {DataType} - instance of DataType
   */
  public setIsArray(isArray: boolean): DataType {
    this.array = isArray;

    return this;
  }

  /**
   * Getter for the `values` property.
   *
   * @memberOf DataType
   * @returns {string} - enum values
   */
  public getValues(): string[] {
    return this.values;
  }

  /**
   * Setter for the `values` property.
   *
   * @memberOf DataType
   * @param {string[]} type - enum values
   * @returns {DataType} - instance of DataType
   */
  public setValues(values: string[]): DataType {
    this.values = values;

    return this;
  }
}
