import utils from '../../../commons/utils/utils';

export class Service {
  public getService(model: string) : string {
    const modelTitleCase = utils.toTitleCase(model);

    return `const repositoryFactory = require('../repositories/repositoryFactory');

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
        .catch(er => {
          reject(er); //TODO: map err into exception
        });
    });
  }
  
  get(id) {
    return new Promise((resolve, reject) => {
      this.repository.get(id)
        .then(data => {
          if (!data) {
            return reject({'status': 404, 'message': 'No ${modelTitleCase} found with id ' + id});
          }
          resolve(data);
        })
        .catch(err => {
          reject(err); //TODO: map err into exception
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
          reject(err); //TODO: map err to response
        });
     });
  }
  
  delete(id) {
    return new Promise((resolve, reject) => {
      this.repository.exists(id)
        .then(exists => {
          if (!exists) {
            return reject({'status': 404, 'message': 'No ${modelTitleCase} found with id: ' + id}); // map err into exception
          }
          return this.repository.delete(id);
        })
        .then(affected${modelTitleCase} => {
              if (!affected${modelTitleCase}) {
                return reject({'status': 500, 'message': 'Internal server error'}); // map err into exception
              }
              resolve(true);
        })
        .catch(err => {
          reject(err); //TODO: map err into exception          
        });
    });
  }
  
  update(id, data) {
    return new Promise((resolve, reject) => {
      this.repository.exists(id)
        .then(exists => {
          if (!exists) {
            return reject({'status': 404, 'message': 'No ${modelTitleCase} found with id ' + id});
          }
          return this.repository.update(id, data);
        })
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject(err); //TODO: map err into exception
        });
    });
  }
}

module.exports = new ${modelTitleCase}Service();`;
  }
}

export default new Service();