import utils from '../../commons/utils/utils';
import config from '../../configs/config';
import schemaUtil from '../../commons/utils/schemaUtil';
import { Table, Column } from '../../commons/types';

/**
 * Class which holds the logic for generating raml types.
 *
 * @export
 */
export class RamlContentGenerator {

  /**
   * Generate type file content.
   *
   * @param  table - table schema
   * @return  raml content
   */
  public generateTypeContent(table: Table): string {
    let objectContent: string = '#%RAML 1.0 DataType\ntype: object\nproperties:\n';

    table.columns.forEach((column: Column) => {
      objectContent += utils.formatLine(config.DEFAULT_INDENTATION, 0, `${column.name}:`);
      objectContent += utils.formatLine(
        config.DEFAULT_INDENTATION,
        1,
        `required: ${column.allowNull ? 'false' : 'true'}`,
      );

      const typeLine: string = column.dataType.values ? schemaUtil.valuesToRamlDataType(column.dataType.values) :
        `${column.dataType.type}${(column.dataType.isArray ? '[]' : '')}`;

      objectContent += utils.formatLine(config.DEFAULT_INDENTATION, 1, `type: ${typeLine}`);
    });

    return objectContent;
  }
}

export default new RamlContentGenerator();
