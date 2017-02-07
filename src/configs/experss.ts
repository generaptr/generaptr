import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

export default (app: express.Express) => {
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    return app;
};
