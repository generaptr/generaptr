import * as express from 'express';
import { Request, Response } from 'express';
import params from './configs/params';
import loadExpressConfigs from './configs/experss';

namespace express_web_api {

    // Initialize express and set port number
    let app = express();

    app = loadExpressConfigs(app);

    // Handle GET for the root URL
    app.get('/', (req: Request, resp: Response) => {
        resp.send('Hello Express!');
    });

    // Start the web app
    app.listen(params.APP_PORT, () => console.log(`App listening on port ${params.APP_PORT}`));
}
