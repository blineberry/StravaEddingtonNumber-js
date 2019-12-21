let express = require('express');
let router = express.Router();

let controller = require('../controllers/accountController');

router.get('/', controller.indexGET);
router.get('/login', controller.loginGET);
router.get('/auth', controller.authGET);
router.post('/deauthorize', controller.deauthorizePOST);
router.post('/logout', controller.logoutPOST);
router.route('/delete')
    .get(controller.deleteGET)
    .post(controller.deletePOST);

module.exports = router;
