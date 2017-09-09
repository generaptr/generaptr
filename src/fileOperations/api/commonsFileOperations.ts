import fileUtil from '../../commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import util from '../../generators/api/commons/util';
import constants from '../../generators/api/commons/constants';

export class CommonsFileOperations {
  public async initializeUtil(filePath: string): Promise<boolean> {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.COMMONS, 'util.js'),
      util.getUtil()
    );
  }

  public async initializeConstants(filePath: string): Promise<boolean> {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONSTANTS, 'statusCode.js'),
      constants.getStatusCode()
    );
  }
}

export default new CommonsFileOperations();