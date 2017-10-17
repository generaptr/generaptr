import fileUtil from '../../commons/utils/file';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import util from '../../contentGenerators/api/commons/util';
import constants from '../../contentGenerators/api/commons/constants';

/**
 * Class which implements the logic for commons / constants files initializer actions.
 *
 * @export
 * @class CommonsFileOperations
 */
export class CommonsFileOperations {
  /**
   * Initialize UtilGenerator class
   * @param {string} filePath - file path where api will be generated
   * @return {boolean} - true if was successfully created
   */
  public initializeUtil(filePath: string): boolean {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.COMMONS, 'util.js'),
      util.getUtil(),
    );
  }

  /**
   * Initialize constants classes
   * @param {string} filePath - file path where api will be generated
   * @return {boolean} - true if was successfully created
   */
  public initializeConstants(filePath: string): boolean {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONSTANTS, 'statusCode.js'),
      constants.getStatusCode(),
    );
  }
}

export default new CommonsFileOperations();
