class RamlContentGenerator {

    constructor() {
        this.DOUBLE_SPACE = '  ';
    }

    /**
     * Generate type content
     * @param table - single table
     * @returns {string}
     */
    generateTypeContent(table) {
        let objectContent = '#%RAML 1.0 DataType\n'
            + 'type: object\n'
            + 'properties:';

        Object.keys(table.columns).map(key => {
            objectContent += ('\n' + `${this.DOUBLE_SPACE}` + key + (table.columns[key].nullable === 'NO' ? '' : '?') + ': ' + table.columns[key].type);
        });

        return objectContent;
    }
}

module.exports = new RamlContentGenerator();