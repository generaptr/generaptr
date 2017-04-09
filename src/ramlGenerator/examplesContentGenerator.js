const utils = require('../commons/utils/utils');
const ramlUtil = require('../commons/utils/ramlUtil');
const cacheUtil = require('../commons/utils/cacheUtil');
const schemaUtil = require('../commons/utils/schemaUtil');
const config = require('../configs/config');

class ExamplesContentGenerator {
  constructor() {
    this.defaultRamlTypes = [
      'number', 'boolean', 'string', 'date-only', 'datetime',
      'time-only', 'datetime-only', 'file', 'nil', 'union',
    ];
    this.PRIME_KEY = 'raml';
  }

  /**
   * Generate type example for a certain table
   * @param {*} schema - entire collection of tables
   * @param {*} table - table information
   * @param {int} depthLevel - columns depth level to be computed
   * @return {{type: *}} object containing - type name(with titleCase)
   *                                       - table content object to be stringified
   */
  generateTypeExampleContent(schema, table, depthLevel) {
    let object = {
      type: utils.toTitleCase(table.name),
    };

    // get table from cache
    object.data = cacheUtil.get(this.PRIME_KEY, object.type) || {};

    if (Object.keys(object.data).length) {
      return object;
    }

    table.columns.map(column => {
      if (this.defaultRamlTypes.includes(column.dataType.type)) {
        // default raml type
        object.data[column.name] = ramlUtil.generateFakeData(column.name, column.dataType.type);
      } else {
        // get object from cache
        let cachedObject = cacheUtil.get(this.PRIME_KEY, `${column.dataType.type}${column.dataType.isArray ? '[]' : ''}`);

        if (cachedObject) {
          object.data[column.name] = cachedObject;
        } else {
          if (depthLevel >= config.DEFAULT_MAX_DEPTH_LEVEL) {
            // depth level exceeded
            object.data[column.name] = column.dataType.isArray ? [] : {};
          } else {
            object.data[column.name] = column.dataType.isArray ?
              utils.fillArray(
                this.generateTypeExampleContent(
                  schema,
                  schemaUtil.getNormalizedTableByType(
                    schema,
                    column.dataType.type
                  ),
                  depthLevel + config.DEPTH_INCREMENT
                ).data,
                config.DEFAULT_ARRAY_LENGTH
              ) :
              this.generateTypeExampleContent(
                schema,
                schemaUtil.getNormalizedTableByType(
                  schema,
                  column.dataType.type
                ),
                depthLevel + config.DEPTH_INCREMENT
              ).data;
          }
        }
      }
    });

    // save object and object[] in cache
    cacheUtil.add(this.PRIME_KEY, object.type, object.data);
    cacheUtil.add(this.PRIME_KEY, `${object.type}[]`, utils.fillArray(object.data, config.DEFAULT_ARRAY_LENGTH));

    return object;
  }
}

module.exports = new ExamplesContentGenerator();

