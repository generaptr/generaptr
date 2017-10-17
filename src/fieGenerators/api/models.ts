import fileUtil from '../../commons/utils/file';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import modelGenerator from '../../contentGenerators/api/models';
import { Schema } from '../../commons/types';

/**
 * Class which implements the logic for odm initializer actions.
 *
 * @export
 * @class ModelsFileOperations
 */
export class ModelsFileOperations {

  /**
   * Generate sequelize models based on schema.
   *
   * @param {string} filePath path of the root of the api
   * @param {Schema} schema source schema for api generation
   * @return {boolean} true if all models have been generated
   */
  public initializeSequelizeModels(filePath: string, schema: Schema): boolean {
    modelGenerator.sequelize.getModels(schema).forEach((model: {name: string; content: string}) => {
      fileUtil.writeFile(
        `${filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS}/${model.name}`,
        model.content,
      );
    });

    return true;
  }
}

export default new ModelsFileOperations();
