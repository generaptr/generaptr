import * as express from 'express';
import { Request, Response } from 'express';
import params from './configs/params';
import loadExpressConfigs from './configs/experss';
import router from './configs/router';

namespace express_web_api {

    // Initialize express and set port number
    let app = express();

    app = loadExpressConfigs(app);

    app.use(router);

    // Start the web app
    app.listen(params.APP_PORT, () => console.log(`App listening on port ${params.APP_PORT}`));
}
