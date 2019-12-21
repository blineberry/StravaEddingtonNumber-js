let express = require('express');
let router = express.Router();

let actions = require('../actions');

router.get('/', actions.account);
router.get('/login', actions.login);
router.get('/auth', actions.auth);
router.post('/deauthorize', actions.deauthorize);
router.post('/logout', actions.logout);

module.exports = router;
