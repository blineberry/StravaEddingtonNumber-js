let express = require('express');
let router = express.Router();

let actions = require('../actions');

router.get('/', actions.home);
router.get('/eddington', actions.eddington);

module.exports = router;
