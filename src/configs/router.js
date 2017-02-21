const router = require('express').Router();
const indexController = require('../controllers/indexController.js');

router.use('/', indexController);

module.exports = router;