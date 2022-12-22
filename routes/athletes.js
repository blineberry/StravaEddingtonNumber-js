let express = require('express');
let router = express.Router();

let controller = require('../controllers/athletesController');

router.get('/:id', controller.detailsGET);


module.exports = router;
