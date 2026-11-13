/**
 * Class which generates string content for API controller files
 *
 * @export
 */
export class Controller {
  /**
   * Generate default controller string content
   * @return  - default controller content
   */
  public getDefaultController(): string {
    return `const defaultRoute = require('express').Router();

defaultRoute.get('/', (request, response, next) => {
  response.json({ message: 'Hello from Generaptr' });
});

module.exports = defaultRoute;`;
  }

  /**
   * Generate controller content for one model.
   * @param  model - model string value. e.g: User
   * @return  - string content for generated controller
   */
  public getController(model: string): string {
    return `const ${model}Route = require('express').Router();
const ${model}Service = require('../services/${model}Service');
const Util = require('../commons/util');
const STATUS_CODE = require('../commons/constants/statusCode');

${model}Route.post('/', (request, response) => {
  ${model}Service.save(request.body)
    .then(id => {
      response.header('Location', Util.generateLocationUri(request, id));
      response.status(STATUS_CODE.CREATED);
      response.end();
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

${model}Route.get('/:id', (request, response) => {
  ${model}Service.get(request.params.id)
    .then(data => {
      response.status(STATUS_CODE.OK);
      response.json(data);
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

${model}Route.delete('/:id', (request, response) => {
  ${model}Service.delete(request.params.id)
    .then(() => {
      response.status(STATUS_CODE.NO_CONTENT);
      response.end();
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

${model}Route.put('/:id', (request, response) => {
  ${model}Service.update(request.params.id, request.body)
    .then(data => {
      response.status(STATUS_CODE.OK);
      response.json(data);
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

${model}Route.get('/', (request, response) => {
  ${model}Service.getAll(request.query.offset, request.query.limit)
    .then(data => {
      if (!data || data.size === 0) {
        response.status(STATUS_CODE.NO_CONTENT);
        response.end();
      } else {
        response.status(STATUS_CODE.OK);
        response.json(data);
      }
    })
    .catch(err => {
      response.status(err.status);
      response.json(err);
    });
});

module.exports = ${model}Route;`;
  }
}

export default new Controller();
