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
     * @param schema - collection of tables
     * @param type - data type normalized (E.g: User, Account)
     * @return {string}
     */
    getNormalizedTableByType(schema, type) {
        for (const table of schema) {
            if (Utils.toTitleCase(table.name) === type) {
                return table;
            }
        }
    }
}

module.exports = new SchemaUtil();