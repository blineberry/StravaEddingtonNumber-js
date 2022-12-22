const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const primeStravaApi = require('../middleware/primeStravaApi');
const loadAthlete = require('../middleware/loadAthlete');
const fetchNewStravaActivities = require('../middleware/fetchNewStravaActivities');
const eddington = require('../eddington');

let indexGET = (req, res) => {
    res.redirect('/athletes/' + req.appData.loggedInAthlete.id);
    return;
};

module.exports = {
    indexGET: [requireStravaAuth, 
        refreshStravaToken, 
        primeStravaApi, 
        loadAthlete,
        fetchNewStravaActivities,
        indexGET
    ],
    eddingtonGET: [(req, res) => {
        res.render('home/eddington.njk', { 
            stravaAuthUrl: req.appData.db.stravaAuth.getConnectUrl(req), 
            isLoggedIn: !!req.session.stravaToken
        });
    }],
    dataGET: [refreshStravaToken, 
        primeStravaApi, 
        loadAthlete,
        (req, res) => {
        res.render('home/data.njk', {
            loggedInAthlete: req.appData.loggedInAthlete,
            isLoggedIn: !!req.session.stravaToken,
            loginUrl: req.appData.loginUrl
        });
    }],
};
