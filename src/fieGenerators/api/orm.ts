import * as chalk from 'chalk';
import { exec } from 'child_process';
import fileUtil from '../../commons/utils/file';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import modelGenerator from '../../contentGenerators/api/models';
/**
 * Class which implements the logic for odm initializer actions.
 *
 * @export
 * @class ORMFileOperations
 */
export class ORMFileOperations {

  /**
   * Initializes sequelize
   * @param {string} filePath filepath
   * @returns {Promise<boolean>} initialized sequelize
   * @memberof ODMFileOperations
   */
  public async initSequelize(filePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve: (data: boolean) => void, reject: (reason: Error) => void): void => {
      console.log(`running: ${chalk.green('sequelize init')}`);
      exec(
        `cd ${filePath} && ./node_modules/.bin/sequelize init && rm -rf ./config ./models`,
        (err: Error) => {
           /* istanbul ignore next */
          if (err) {
            return reject(err);
          }

          resolve(fileUtil.writeFile(
            `${filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS}/index.js`,
            modelGenerator.sequelize.getModelsRegistry(),
          ));
      });
    });
  }

}

export default new ORMFileOperations();
