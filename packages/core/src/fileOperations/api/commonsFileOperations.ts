import fileUtil from '../../commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import util from '../../generators/api/commons/util';
import constants from '../../generators/api/commons/constants';

/**
 * Class which implements the logic for commons / constants files initializer actions.
 *
 * @export
 */
export class CommonsFileOperations {
  /**
   * Initialize Util class
   * @param  filePath - file path where api will be generated
   * @return  - true if was successfully created
   */
  public async initializeUtil(filePath: string): Promise<boolean> {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.COMMONS, 'util.js'),
      util.getUtil(),
    );
  }

  /**
   * Initialize constants classes
   * @param  filePath - file path where api will be generated
   * @return  - true if was successfully created
   */
  public async initializeConstants(filePath: string): Promise<boolean> {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONSTANTS, 'statusCode.js'),
      constants.getStatusCode(),
    );
  }
}

export default new CommonsFileOperations();
