import fileUtil from '../../commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import modelGenerator from '../../generators/api/models';
import { Schema } from '../../commons/types';

/**
 * Class which implements the logic for odm initializer actions.
 *
 * @export
 */
export class ModelsFileOperations {

  /**
   * Generate sequelize models based on schema.
   *
   * @param  filePath path of the root of the api
   * @param  schema source schema for api generation
   * @return  true if all models have been generated
   */
  public async initializeSequelizeModels(filePath: string, schema: Schema): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];

    modelGenerator.sequelize
      .getModels(schema)
      .forEach((model: { name: string; content: string }) => {
        promises.push(fileUtil.writeFile(
          `${filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS}/${model.name}`,
          model.content,
        ));
      });

    return Promise.all(promises);
  }
}

export default new ModelsFileOperations();
