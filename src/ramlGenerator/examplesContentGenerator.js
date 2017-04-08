const Utils = require('../commons/utils/utils');
const RamlUtil = require('../commons/utils/ramlUtil');
const CacheUtil = require('../commons/utils/cacheUtil');

class ExamplesContentGenerator {
    constructor() {
        this.defaultRamlTypes = [
            'number', 'boolean', 'string', 'date-only', 'datetime',
            'time-only', 'datetime-only', 'file', 'nil', 'union'
        ];
        this.PRIME_KEY = 'raml';
    }

    /**
     * Generate type example for a certain table
     * @param table - table information
     * @return {{type: *}} object containing - type name(with titleCase)
     *                                       - table content object to be stringified
     */
    generateTypeExampleContent(table) {
        let object = {
            type: Utils.toTitleCase(table.name),
            data: {}
        };

        table.columns.map(column => {
            object.data[column.name] = this.generateColumnObject(column);
        });

        // save object and object[] in cache
        CacheUtil.add(this.PRIME_KEY, object.type, object.data);
        CacheUtil.add(this.PRIME_KEY, (object.type + '[]'), Utils.fillArray(object.data, 2));

        return object;
    }

    /**
     * Generate random content for a column
     * @param column
     * @return {{type: *}}
     */
    generateColumnObject(column) {
        if (this.defaultRamlTypes.indexOf(column.dataType.type) >= 0) {
            // default raml type
            return RamlUtil.generateFakeData(column.name, column.dataType.type);
        } else {
            // get object from cache
            let object = CacheUtil.get(this.PRIME_KEY, Utils.toTitleCase(column.dataType.type + column.dataType.isArray ? '[]' : ''));

            if (!object) {
                throw new Error('Custom object could not be found in cache.');
            }

            return object;
        }
    }
}

module.exports = new ExamplesContentGenerator();

