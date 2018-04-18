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


  private source: {column: string};

  /**
   * Used in the relation direction definition.
   *
   * @property {boolean} owned - flag
   */
  private owned: boolean = false;

  /**
   * Used in the checking if source column differes from target table.
   *
   * @property {boolean} alias - flag
   */
  private alias: boolean = false;
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
   * Setter for `source` property.
   *
   * @memberOf ForeignKey
   * @param {{column: string}} source - source table and column
   * @returns {ForeignKey} - instance of ForeignKey
   */
  public setSource(source: {column: string}): ForeignKey {
    this.source = source;

    return this;
  }
  /** 
   * Getter for `source` property.
   *
   * @memberOf ForeignKey
   * @returns {{column: string}} - source column
   */
  public getSource(): {column: string} {
    return this.source;
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

  /**
   * Setter for `alias` property.
   *
   * @memberOf ForeignKey
   * @param {boolean} alias - true if relation is source column name differes from the target table name.
   * @returns {ForeignKey} - instance of ForeignKey
   */
  public setAlias(alias: boolean): ForeignKey {
    this.alias = alias;

    return this;
  }

  /**
   * Getter for `alias` property.
   *
   * @memberOf ForeignKey
   * @returns {boolean} - relation direction
   */
  public isAlias(): boolean {
    return this.alias;
  }
}
