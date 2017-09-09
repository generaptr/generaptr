import fileUtil from '../../commons/utils/fileUtil';
import utils from '../../commons/utils/utils';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import {Schema, Table} from '../../commons/types';
import service from '../../generators/api/services/service';

export class ServicesFileOperations {

  public async initializeServices(filePath: string, schema: Schema) {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];

    schema.forEach((table: Table) => {
      const model = utils.singular(table.name);

      promises.push(fileUtil.writeFile(
        fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.SERVICES, `${model}Service.js`),
        service.getService(model))
      );
    });

    return Promise.all(promises);
  }
}

export default new ServicesFileOperations();