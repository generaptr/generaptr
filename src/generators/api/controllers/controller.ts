export class Controller {
  public getDefaultController() : string {
    return `const defaultRoute = require('express').Router();
    
defaultRoute.get('/', (request, response, next) => {
  response.json({ message: 'Hello from Generaptr' });
});

module.exports = defaultRoute;`;
  }

  public getController(model: string): string {
    return `const ${model}Route = require('express').Router();
const ${model}Service = require('../services/${model}Service');

${model}Route.post('/', (request, response) => { 
  ${model}Service.save(request.body)
    .then(id => {
      response.header('Location', 'someShitHere');
      response.status(201);
      response.end();
    });  
});

${model}Route.get('/:id', (request, response) => {
  ${model}Service.get(request.params.id)
    .then(data => { 
      if (!data) {
        response.status(404);
        response.json({code: 404, message: 'No ${model} found for id' + request.params.id});
      } else {
        response.status(200);
        response.json(data);
      }
    });
});

${model}Route.delete('/:id', (request, response) => {
  ${model}Service.delete(request.params.id)
    .then(() => {
      response.status(200);
      response.end();
    });
});

${model}Route.put('/:id', (request, response) => {
  ${model}Service.update(request.params.id, request.body)
    .then(updatedData => {
      if (!updatedData) {
        response.status(404);
        response.json({code: 404, message: 'No ${model} found for id' + request.params.id});
      } else {
        response.status(200);
        response.json(data);
      }
    });
});

${model}Route.get('/', (request, response) => {
  ${model}Service.getAll(request.params.offset, request.params.limit)
    .then(data => {
      if (!data || data.length === 0) {
        response.status(204);
        response.end();
      } else {
        response.status(200);
        response.json(data);
      }
    });
});

module.exports = ${model}Route;`;
    // TODO: generate util class for generating location !!!
    // TODO: reject promise from service and on catch return exception
  }
}

export default new Controller();