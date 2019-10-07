/**
 * Class which generates string content for main js file
 *
 * @export
 */
export class Index {

  /**
   * Generate main js file string content
   * @return  - generated content for index.js file
   */
  public getIndex(): string {
    return `const express = require('express');
const AppError = require('./commons/AppError');
const profile = require('./configs/index.js').getEnvBasedConfig();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('../middlewares/cors');
const router = require('./configs/router.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan(profile.morgan));
app.use(cors);

app.use((error, req, res, next) => {
  if (error) {
    const response = {
    success: false,
    message: error.message || 'Something went wrong. Please try again later',
  };
  if (error instanceof AppError) {
    response.type = error.type;
    response.data = error.data || [];
  }

  res.status(error.status || 500).json(response);
  } else {
    next();
  }
});

app.use('/', router);

app.listen(profile.APP_PORT, () => {
  console.log('App started on port: ' + profile.APP_PORT);
});`;
  }
}

export default new Index();
