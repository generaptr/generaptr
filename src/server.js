const express = require('express');
const params =  require('./configs/params.js');
const loadExpressConfigs = require('./configs/experss.js');
const router = require('./configs/router.js');

let app = express();

app = loadExpressConfigs(app);

app.use(router);

// Start the web app
app.listen(params.APP_PORT, () => console.log(`App listening on port ${params.APP_PORT}`));


module.exports = app;