const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const primeStravaApi = require('../middleware/primeStravaApi');
const loadAthlete = require('../middleware/loadAthlete');

let action = (req, res) => {
    return res.render('account.njk', { athlete: req.appData.athlete });
};

module.exports = [requireStravaAuth, 
    refreshStravaToken, 
    primeStravaApi, 
    loadAthlete,
    action];
    