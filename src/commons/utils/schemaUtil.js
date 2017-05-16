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
}

module.exports = new SchemaUtil();
