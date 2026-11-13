import chalk from 'chalk';
import * as fs from 'node:fs/promises';
import fileUtil from '../../commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import modelGenerator from '../../generators/api/models';
/**
 * Class which implements the logic for odm initializer actions.
 *
 * @export
 */
export class ORMFileOperations {

  /**
   * Initializes sequelize
   * @param  filePath filepath
   * @returns  initialized sequelize
   */
  public async initSequelize(filePath: string): Promise<boolean> {
    console.log(`running: ${chalk.green('sequelize init')}`);
    await fs.mkdir(`${filePath}/migrations`, { recursive: true });
    await fs.mkdir(`${filePath}/seeders`, { recursive: true });

    return fileUtil.writeFile(
      `${filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS}/index.js`,
      modelGenerator.sequelize.getModelsRegistry(),
    );
  }

}

export default new ORMFileOperations();
