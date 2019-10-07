import utils from '../../../commons/utils/utils';

/**
 * Class which generates string content for API services files
 *
 * @export
 */
export class Service {

  /**
   * Generate String content for one service file using model
   * @param  model - model name. e.g: User
   * @return  - string content for generated service
   */
  public getService(model: string): string {
    const modelTitleCase: string = utils.toTitleCase(model);

    return `const repositoryFactory = require('../repositories/repositoryFactory');
const AppError = require('../commons/AppError');
const STATUS_CODE = require('../commons/constants/statusCode');

class ${modelTitleCase}Service {
  constructor() {
    this.repository = repositoryFactory.getRepositoryForModel('${modelTitleCase}');
  }

  async save(data) {
    try {
      return this.repository.save(data);
    } catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    try {
      const data = await this.repository.get(id);
      if (!data) {
        throw new AppError('No ${modelTitleCase} found with id ' + id, STATUS_CODE.NOT_FOUND);
      }

      return data;
    } catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll(offset = 0, limit = 15) {
    try {
      const result = {
        meta: {
          offset: offset,
          limit: limit,
          count: 0
        },
        data: []
      };

      const data = await this.repository.getAll(Number(offset), Number(limit));
      const count = await this.repository.count();

      result.data = data;
      result.meta.count = count;

      return result;
    } catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new AppError('No ${modelTitleCase} found with id: ' + id, STATUS_CODE.NOT_FOUND);
      }
      return this.repository.delete(id);
    } catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id, data) {
    try {
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new AppError('No ${modelTitleCase} found with id: ' + id, STATUS_CODE.NOT_FOUND);
      }
      await this.repository.update(id, data);

      return this.get(id);
    } catch (error) {
      throw new AppError(error.message, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new ${modelTitleCase}Service();`;
  }
}

export default new Service();
