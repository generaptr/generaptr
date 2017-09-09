import utils from '../../../commons/utils/utils';

export class Service {
  public getService(model: string) : string {
    const modelTitleCase = utils.toTitleCase(model);

    return `const repositoryFactory = require('../repository/repositoryFactory');

class ${modelTitleCase}Service {
  constructor() {
    this.repository = repositoryFactory.getRepositoryForModel('${modelTitleCase}');
  }

  save(data) {
    
  }
  
  get(id) {
    
  }
  
  delete(id) {
  
  }
  
  update(id, data) {
  
  }
  
  getAll(offset, limit) {
    
  }
}

module.exports = new ${modelTitleCase}Service();
`;
  }
}

export default new Service();