let express = require('express');
let router = express.Router();

let athletesController = require('../controllers/accountController');

router.route('/delete')
    .get(athletesController.deleteGET)
    .post(athletesController.deletePOST);


module.exports = router;
