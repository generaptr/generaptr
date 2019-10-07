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
    return `const router = require('express').Router();
const ${model}Service = require('../services/${model}Service');
const { generateLocationUri } = require('../commons/util');
const STATUS_CODE = require('../commons/constants/statusCode');

router.get('/', async (request, response, next) => {
  try {
    const data = await ${model}Service.getAll(request.query.offset, request.query.limit);
    if (!data || data.length === 0) {
      response
        .status(STATUS_CODE.NO_CONTENT)
        .json({success: true});
    } else {
      response
        .status(STATUS_CODE.OK)
        .json({success: true, data});
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const id = await ${model}Service.save(request.body);
    response
      .header('Location', generateLocationUri(request, id))
      .status(STATUS_CODE.CREATED)
      .json({success: true});
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const data = await ${model}Service.get(request.params.id);
    response
      .status(STATUS_CODE.OK)
      .json({success: true, data});
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    await ${model}Service.delete(request.params.id)
    response
      .status(STATUS_CODE.NO_CONTENT)
      .json({success: true});
  } catch(error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const data = await ${model}Service.update(request.params.id, request.body);
    response
      .status(STATUS_CODE.OK)
      .json({success: true, data});
  } catch(error) {
    next(error);
  }
});

module.exports = router;`;
  }
}

export default new Controller();
