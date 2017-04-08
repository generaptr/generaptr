const Utils = require('../commons/utils/utils');

class ExamplesContentGenerator {
    constructor() {
        // cached types for using later if the same type is generated multiple times
        this.cachedTypes = {};
        this.defaultRamlTypes = [
            'number', 'boolean', 'string', 'date-only', 'datetime',
            'time-only', 'datetime-only', 'file', 'nil', 'union'
        ];
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

        // save object in cache
        this.cachedTypes[object.type] = object.data;

        return object;
    }

    /**
     * Generate random content for a column
     * @param column
     * @return {{type: *}}
     */
    generateColumnObject(column) {
        // get object from cache
        let object = this.cachedTypes[Utils.toTitleCase(column.dataType.type)];

        if (object) {
            return object.data;
        }

        if (this.defaultRamlTypes.indexOf(column.dataType.type)) {
            // default raml type
            return Utils.generateFakeData(column.name, column.dataType.type);
        } else {
            // aggregate type
            //todo: to be implemented: general objects {name: "asd", surname: "asd"}

            //save in cache
            this.cachedTypes[Utils.toTitleCase(column.dataType.type)] = object;

            return object;
        }
    }
}

module.exports = new ExamplesContentGenerator();

