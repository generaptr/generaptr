const Utils = require('./utils');

class SchemaUtil {

  /**
   * Get normalized schema by type
   * Schema E.g: [
   *  {
     *      name: 'users',
     *      columns: [
     *          {
     *              id: 1,
     *              name: 'Some Name',
     *              ...
     *          }
     *      ]
     *  }
   * ]
   * @param {*} schema - collection of tables
   * @param {string} type - data type normalized (E.g: User, Account)
   * @return {*} table from schema that matches type.
   */
  getNormalizedTableByType(schema, type) {
    for (const table of schema) {
      /* istanbul ignore else */
      if (Utils.toTitleCase(table.name) === type) {
        return table;
      }
    }

    return false;
  }

  /**
   * Convert values from COLUMN_TYPE column
   * @param {*} schema - schema eg.
   * {...
   *  dataType: {
   *    type: enum,
   *    isArray: false,
   *    values: enum('Yes', 'No')
   *  }
   * }
   */
  convertValues(schema) {
    if (schema && schema.dataType) {
      const columnType = schema.dataType.values;

      switch (schema.dataType.type) {
        case 'enum':
          schema.dataType.values = columnType ? (columnType.substring(4).replace(/["'()]/g,'').replace(' ', '').split(',')) : [];
          break;
        default:
          delete schema.dataType.values; // no values to be processed for now
      }
    }
  }

  /**
   * Convert array of values to raml values
   * @param {Array} values - ['Yes', 'No']
   * @return {*} - 'Yes | No'
   */
  valuesToRamlDataType(values) {
    return (values && values.length > 0) ? values.join(' | ') : [];
  }
}

module.exports = new SchemaUtil();
