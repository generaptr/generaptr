import fileUtil from '../../commons/utils/fileUtil';
import utils from '../../commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import controller from '../../generators/api/controllers/controller';
import {Schema, Table} from "../../commons/types";

export class ControllersFileOperations {

  /**
   *
   * @param filePath
   * @param schema
   * @return {Promise<boolean[]>}
   */
  public async initializeControllers(filePath: string, schema: Schema): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];

    promises.push(fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS, 'defaultController.js'),
      controller.getDefaultController())
    );

    schema.forEach((table: Table) => {
      const model = utils.singular(table.name);

      promises.push(fileUtil.writeFile(
        fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONTROLLERS, `${model}Controller.js`),
        controller.getController(model))
      );
    });

    return Promise.all(promises);
  }
}

export default new ControllersFileOperations();