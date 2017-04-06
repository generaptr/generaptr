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

        table.columns.forEach(column => {
            objectContent += `\n${this.DOUBLE_SPACE}${column.name}${column.allowNull ? '?' : ''}: ${column.dataType.type}${column.dataType.isArray ? '[]' : ''}`;
        });

        return `${objectContent}\n`;
    }
}

module.exports = new RamlContentGenerator();