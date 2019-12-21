let express = require('express');
let router = express.Router();

let activitiesController = require('../controllers/activitiesController');

router.route('/delete')
    .get(activitiesController.deleteAllGET)
    .post(activitiesController.deleteAllPOST);


module.exports = router;
