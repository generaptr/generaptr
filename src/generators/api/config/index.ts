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
const profile = require('./configs/index.js').getEnvBasedConfig();
const loadExpressConfig = require('./configs/express.js');
const router = require('./configs/router.js');

let app = express();
app = loadExpressConfig(app);

app.use('/', router);

app.listen(profile.APP_PORT, () => {
  console.log('App started on port: ' + profile.APP_PORT);
});`;
  }
}

export default new Index();
