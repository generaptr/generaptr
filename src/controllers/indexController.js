const router = require('express').Router();

router.get('/', (req, resp) => {
  resp.json({message: 'Api entrypoint'});
});

module.exports = router;