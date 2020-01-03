let express = require('express');
let router = express.Router();

let homeController = require('../controllers/homeController');

router.get('/', homeController.indexGET);
router.get('/eddington', homeController.eddingtonGET);
router.get('/data', homeController.dataGET);

module.exports = router;
