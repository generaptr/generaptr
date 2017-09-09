export class Express {
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