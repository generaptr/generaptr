import fileUtil from '../../commons/utils/fileUtil';
import utils from '../../commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import { Schema, Table } from '../../commons/types';
import service from '../../generators/api/services/service';

/**
 * Class which implements the logic for service files initializer actions.
 *
 * @export
 */
export class ServicesFileOperations {

  /**
   * Initialize services files
   * @param  filePath - file path where api will be generated
   * @param  schema - schema information
   * @return  - an array of booleans with created status
   */
  public async initializeServices(filePath: string, schema: Schema): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];

    schema.forEach((table: Table) => {
      const model: string = utils.singular(table.name);

      promises.push(fileUtil.writeFile(
        fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.SERVICES, `${model}Service.js`),
        service.getService(model),
      ));
    });

    return Promise.all(promises);
  }
}

export default new ServicesFileOperations();
