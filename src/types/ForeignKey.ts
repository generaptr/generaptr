/**
 * Foreign Key type class.
 *
 * @namespace types
 * @class ForeignKey
 */
export default class ForeignKey {
  /**
   * Holds the foreign relation type.
   *
   * @property {'1-1' | '1-n' 'n-n'} type - relation type
   */
  private type: '1-1' | '1-n' | 'n-n';

  /**
   * Holds the target table and column of the relation.
   *
   * @property {{table: string; column: string;}} target - target table and column
   */
  private target: {table: string; column: string};

  /**
   * Used in the relation direction definition.
   *
   * @property {boolean} owned - flag
   */
  private owned: boolean = false;

  /**
   * Setter for `type` property.
   *
   * @memberOf ForeignKey
   * @param {'1-1' | '1-n' | 'n-n'} type - relation type
   * @returns {ForeignKey} - instance of ForeignKey
   */
  public setType(type: '1-1' | '1-n' | 'n-n'): ForeignKey {
    this.type = type;

    return this;
  }

  /**
   * Getter for `type` property.
   *
   * @memberOf ForeignKey
   * @returns {'1-1' | '1-n' | 'n-n'} - relation type
   */
  public getType(): '1-1' | '1-n' | 'n-n' {
    return this.type;
  }

  /**
   * Setter for `target` property.
   *
   * @memberOf ForeignKey
   * @param {{table: string; column: string}} target - target table and column
   * @returns {ForeignKey} - instance of ForeignKey
   */
  public setTarget(target: {table: string; column: string}): ForeignKey {
    this.target = target;

    return this;
  }

  /**
   * Getter for `target` property.
   *
   * @memberOf ForeignKey
   * @returns {{table: string; column: string}} - target table and column
   */
  public getTarget(): {table: string; column: string} {
    return this.target;
  }

  /**
   * Setter for `owned` property.
   *
   * @memberOf ForeignKey
   * @param {boolean} target - true if relation is owned
   * @returns {ForeignKey} - instance of ForeignKey
   */
  public setOwned(owned: boolean): ForeignKey {
    this.owned = owned;

    return this;
  }

  /**
   * Getter for `owned` property.
   *
   * @memberOf ForeignKey
   * @returns {boolean} - relation direction
   */
  public isOwned(): boolean {
    return this.owned;
  }
}
