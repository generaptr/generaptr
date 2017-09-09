import utils from '../../../commons/utils/utils';

export class Service {
  public getService(model: string) : string {
    const modelTitleCase = utils.toTitleCase(model);

    return `const repositoryFactory = require('../repositories/repositoryFactory');
const STATUS_CODE = require('../commons/constants/statusCode');

class ${modelTitleCase}Service {
  constructor() {
    this.repository = repositoryFactory.getRepositoryForModel('${modelTitleCase}');
  }

  save(data) {
    return new Promise((resolve, reject) => {
      this.repository.save(data)
        .then(id => {
          resolve(id);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
    });
  }
  
  get(id) {
    return new Promise((resolve, reject) => {
      this.repository.get(id)
        .then(data => {
          if (!data) {
            return reject({'status': STATUS_CODE.NOT_FOUND, 'message': 'No ${modelTitleCase} found with id ' + id});
          }
          resolve(data);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
    });
  }
  
  getAll(offset = 0, limit = 15) {
     const result = {
      size: 0,
      data: []
     };
     
     return new Promise((resolve, reject) => {
      this.repository.getAll(offset, limit)
        .then(data => {
          result.data = data;
          
          return this.repository.count();
        })
        .then(count => {
          result.size = count;
          
          resolve(result);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
     });
  }
  
  delete(id) {
    return new Promise((resolve, reject) => {
      this.repository.exists(id)
        .then(exists => {
          if (!exists) {
            return reject({'status': STATUS_CODE.NOT_FOUND, 'message': 'No ${modelTitleCase} found with id: ' + id});
          }
          return this.repository.delete(id);
        })
        .then(affected${modelTitleCase} => {
              resolve(true);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});    
        });
    });
  }
  
  update(id, data) {
    return new Promise((resolve, reject) => {
      this.repository.exists(id)
        .then(exists => {
          if (!exists) {
            return reject({'status': STATUS_CODE.NOT_FOUND, 'message': 'No ${modelTitleCase} found with id ' + id});
          }
          return this.repository.update(id, data);
        })
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject({'status': STATUS_CODE.INTERNAL_SERVER_ERROR, 'message': err.message});
        });
    });
  }
}

module.exports = new ${modelTitleCase}Service();`;
  }
}

export default new Service();