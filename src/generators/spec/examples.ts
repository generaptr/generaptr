import utils from '../../commons/utils/utils';
import ramlUtil from '../../commons/utils/ramlUtil';
import cacheUtil from '../../commons/utils/cacheUtil';
import schemaUtil from '../../commons/utils/schemaUtil';
import config from '../../configs/config';
import { Schema, Table, Column, Example, Everything } from '../../commons/types';

/**
 * Class which holds the logic for generating example data.
 *
 * @export
 * @class ExamplesGenerator
 */
export class ExamplesGenerator {

  /**
   * Array of default raml types supported.
   *
   * @private
   * @type {string[]}
   * @memberof ExamplesGenerator
   */
  private defaultRamlTypes: string[] = [
    'number', 'boolean', 'string', 'date-only', 'datetime',
    'time-only', 'datetime-only', 'file', 'nil', 'union', 'enum',
  ];

  /**
   * Key used in storing and searching for cached elements.
   *
   * @public
   * @type {string}
   * @memberof ExamplesGenerator
   */
  public PRIME_KEY: string = 'raml';

  /**
   * Generate type example for a certain table
   * @param {*} schema - entire collection of tables
   * @param {*} table - table information
   * @param {int} depthLevel - columns depth level to be computed
   * @return {Example} object containing - type name(with titleCase)
   *                                       - table content object to be stringified
   */
  public generateTypeExampleContent(schema: Schema, table: Table, depthLevel: number): Example {
    const object: Example = {
      type: utils.toTitleCase(table.name),
      data: {},
    };

    object.data = cacheUtil.get(this.PRIME_KEY, object.type) || {};

    if (Object.keys(object.data).length) {
      return object;
    }

    table.columns.map((column: Column) => {
      if (this.defaultRamlTypes.indexOf(column.dataType.type) > -1) {
        object.data[column.name] = ramlUtil.generateFakeData(column.name, column.dataType.type, column.dataType.values);
      } else {
        const cachedObject: Everything = cacheUtil.get(
          this.PRIME_KEY,
          `${column.dataType.type}${column.dataType.isArray ? '[]' : ''}`,
        );

        if (cachedObject) {
          object.data[column.name] = cachedObject;
        } else {
          /* istanbul ignore next */
          if (depthLevel >= config.DEFAULT_MAX_DEPTH_LEVEL) {
            object.data[column.name] = column.dataType.isArray ? [] : {};
          } else {
            const normalizedTable: Table | undefined = schemaUtil.getNormalizedTableByType(
              schema,
              column.dataType.type,
            );
            if (normalizedTable) {
              object.data[column.name] = column.dataType.isArray ?
                utils.fillArray(
                  this.generateTypeExampleContent(schema, normalizedTable, depthLevel + config.DEPTH_INCREMENT).data,
                  config.DEFAULT_ARRAY_LENGTH,
                ) :
                this.generateTypeExampleContent(schema, normalizedTable, depthLevel + config.DEPTH_INCREMENT).data;
            }
          }
        }
      }
    });

    cacheUtil.add(this.PRIME_KEY, object.type, object.data);
    cacheUtil.add(this.PRIME_KEY, `${object.type}[]`, utils.fillArray(object.data, config.DEFAULT_ARRAY_LENGTH));

    return object;
  }
}

export default new ExamplesGenerator();
