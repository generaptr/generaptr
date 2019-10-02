/**
 * Class which generates string content for express.js configuration file
 *
 * @export
 */
export class Express {

  /**
   * Generate string content for express.js configuration file
   * @return  - string generated content
   */
  public getExpressConfig(): string {
    return `const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('../middlewares/cors');
const profile = require('./index.js').getEnvBasedConfig();

module.exports = (app) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(morgan(profile.morgan));
  app.use(cors);

  return app;
};`;
  }
}

export default new Express();
