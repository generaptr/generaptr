import { Schema } from '../../commons/types';
import fileUtil from '../../commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import repositoriesGenerator from '../../generators/api/repositories';
/**
 * Class which implements the logic for repository generation.
 *
 * @export
 * @class RepositoriesFileOperations
 */
export class RepositoriesFileOperations {

  /**
   * Initialize sequelize repositories
   *
   * @param {string} filePath - root api file path
   * @param {Schema} schema - source schema for api generation
   * @return {Promise<boolean[]>}
   * @memberof RepositoriesFileOperations
   */
  public async initializeSequelizeRepositories(filePath: string, schema: Schema): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];
    repositoriesGenerator.sequelize.getRepositories(schema).forEach((repository: {name: string; content: string}) => {
      promises.push(fileUtil.writeFile(
        `${filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.REPOSITORIES}/${repository.name}`,
        repository.content,
      ));
    });

    const factory: {name: string; content: string} = repositoriesGenerator.sequelize.getRepositoryFactory(schema);
    promises.push(fileUtil.writeFile(
      `${filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.REPOSITORIES}/${factory.name}`,
      factory.content,
    ));

    return Promise.all(promises);
  }
}

export default new RepositoriesFileOperations();
