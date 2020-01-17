let express = require('express');
let router = express.Router();

let athletesController = require('../controllers/athletesController');

router.route('/:id')
    .get(athletesController.detailsGET);

module.exports = router;
