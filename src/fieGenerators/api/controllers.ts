import fileUtil from '../../commons/utils/file';
import utils from '../../commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import controller from '../../contentGenerators/api/controllers/controller';
import { Schema, Table } from "../../commons/types";

/**
 * Class which generates all controller files
 *
 * @export
 * @class ControllersFileOperations
 */
export class ControllersFileOperations {

  /**
   * Initialize all controller files
   * @param {String} filePath - file path where api will be generated
   * @param {Schema} schema -
   * @return {boolean}
   */
  public initializeControllers(filePath: string, schema: Schema): boolean {

    fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS, 'defaultController.js'),
      controller.getDefaultController(),
    );

    schema.forEach((table: Table) => {
      const model: string = utils.singular(table.name);

      fileUtil.writeFile(
        fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS, `${model}Controller.js`),
        controller.getController(model),
      );
    });

    return true;
  }
}

export default new ControllersFileOperations();
