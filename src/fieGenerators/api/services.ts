import fileUtil from '../../commons/utils/file';
import utils from '../../commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import { Schema, Table } from '../../commons/types';
import service from '../../contentGenerators/api/services/service';

/**
 * Class which implements the logic for service files initializer actions.
 *
 * @export
 * @class ServicesFileOperations
 */
export class ServicesFileOperations {

  /**
   * Initialize services files
   * @param {string} filePath - file path where api will be generated
   * @param {Schema} schema - schema information
   * @return {boolean[]} - an array of booleans with created status
   */
  public initializeServices(filePath: string, schema: Schema): boolean {

    schema.forEach((table: Table) => {
      const model: string = utils.singular(table.name);

      fileUtil.writeFile(
        fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.SERVICES, `${model}Service.js`),
        service.getService(model),
      );
    });

    return true;
  }
}

export default new ServicesFileOperations();
