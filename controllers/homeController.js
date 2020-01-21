const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const primeStravaApi = require('../middleware/primeStravaApi');
const eddington = require('../eddington');

module.exports = {
    indexGET: [requireStravaAuth, 
        refreshStravaToken, 
        primeStravaApi, 
        (req ,res ) => {
            return res.redirect(`/athletes/${ req.session.stravaToken.athleteId }`);
        }
    ],
    eddingtonGET: [(req, res) => {
        res.render('home/eddington.njk', { 
            stravaAuthUrl: req.appData.db.stravaAuth.getConnectUrl(), 
            isLoggedIn: req.appData.isLoggedIn
        });
    }],
    dataGET: [(req, res) => {
        res.render('home/data.njk', {
            isLoggedIn: req.appData.isLoggedIn
        });
    }],
};
