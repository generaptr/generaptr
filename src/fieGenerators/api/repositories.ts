import { Schema } from '../../commons/types';
import fileUtil from '../../commons/utils/file';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import repositoriesGenerator from '../../contentGenerators/api/repositories';
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
   * @return {boolean}
   * @memberof RepositoriesFileOperations
   */
  public initializeSequelizeRepositories(filePath: string, schema: Schema): boolean {
    repositoriesGenerator.sequelize.getRepositories(schema).forEach((repository: {name: string; content: string}) => {
      fileUtil.writeFile(
        `${filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.REPOSITORIES}/${repository.name}`,
        repository.content,
      );
    });

    const factory: {name: string; content: string} = repositoriesGenerator.sequelize.getRepositoryFactory(schema);
    fileUtil.writeFile(
      `${filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.REPOSITORIES}/${factory.name}`,
      factory.content,
    );

    return true;
  }
}

export default new RepositoriesFileOperations();
