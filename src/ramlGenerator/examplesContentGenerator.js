const Utils = require('../commons/utils/utils');
const RamlUtil = require('../commons/utils/ramlUtil');
const CacheUtil = require('../commons/utils/cacheUtil');
const SchemaUtil = require('../commons/utils/schemaUtil');
const Config = require('../configs/config');

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
     * @param schema - entire collection of tables
     * @param table - table information
     * @param depthLevel - columns depth level to be computed
     * @return {{type: *}} object containing - type name(with titleCase)
     *                                       - table content object to be stringified
     */
    generateTypeExampleContent(schema, table, depthLevel) {
        let object = {
            type: Utils.toTitleCase(table.name)
        };

        // get table from cache
        object.data = CacheUtil.get(this.PRIME_KEY, object.type);

        if (object.data) {
            return object;
        } else {
            object.data = {};
        }

        table.columns.map(column => {
            if (this.defaultRamlTypes.includes(column.dataType.type)) {
                // default raml type
                object.data[column.name] = RamlUtil.generateFakeData(column.name, column.dataType.type);
            } else {
                // get object from cache
                let cachedObject = CacheUtil.get(this.PRIME_KEY, `${column.dataType.type}${column.dataType.isArray ? '[]' : ''}`);

                if (cachedObject) {
                    object.data[column.name] = cachedObject;
                } else {
                    if (depthLevel >= Config.DEFAULT_DEPTH_LEVEL) {
                        // depth level exceeded
                        object.data[column.name] = column.dataType.isArray ? [] : {};
                    } else {
                        // generate recursively
                        object.data[column.name] = column.dataType.isArray ?
                            (Utils.fillArray(this.generateTypeExampleContent(schema, SchemaUtil.getNormalizedTableByType(schema, column.dataType.type), (depthLevel + 1)).data, 2)) :
                            (this.generateTypeExampleContent(schema, SchemaUtil.getNormalizedTableByType(schema, column.dataType.type), (depthLevel + 1)).data, 2);
                    }
                }
            }
        });

        // save object and object[] in cache
        CacheUtil.add(this.PRIME_KEY, object.type, object.data);
        CacheUtil.add(this.PRIME_KEY, `${object.type}[]`, Utils.fillArray(object.data, 2));

        return object;
    }
}

module.exports = new ExamplesContentGenerator();

