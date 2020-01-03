let express = require('express');
let router = express.Router();

let homeController = require('../controllers/homeController');

router.get('/', homeController.indexGET);
router.get('/eddington', homeController.eddingtonGET);

module.exports = router;
