const utils = require('../../commons/utils/utils');
const config = require('../../configs/config');
const schemaUtil = require('../../commons/utils/schemaUtil');

class RamlContentGenerator {

  constructor() {
  }

  /**
   * Generate type file content.
   *
   * @param {object} table - table schema
   * @return {string} raml content
   */
  generateTypeContent(table) {
    let objectContent = '#%RAML 1.0 DataType\n'
      + 'type: object\n'
      + 'properties:'
      + config.END_OF_LINE;

    table.columns.forEach(column => {
      objectContent += utils.formatLine(config.DEFAULT_INDENTATION, 0, `${column.name}:`);
      objectContent += utils.formatLine(config.DEFAULT_INDENTATION, 1, `required: ${column.allowNull ? 'false' : 'true'}`);

      const typeLine = column.dataType.values ? schemaUtil.valuesToRamlDataType(column.dataType.values) :
        `${column.dataType.type}${(column.dataType.isArray ? '[]' : '')}`;

      objectContent += utils.formatLine(config.DEFAULT_INDENTATION, 1, `type: ${typeLine}`);
    });
    return `${objectContent}`;
  }
}

module.exports = new RamlContentGenerator();
