const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const primeStravaApi = require('../middleware/primeStravaApi');
const loadAthlete = require('../middleware/loadAthlete');
let stravaAuth = require('../DAL/stravaAuth');
const request = require('superagent');

let redirectToRootIfLoggedIn = (req, res, next) => {
    if (req.session.stravaToken) {
        res.redirect('/');
        return;
    }    

    next();
};

let deauthorize = (accessToken) => {
    return request
    .post('https://www.strava.com/oauth/deauthorize')
    .send({
        access_token: accessToken
    });
};

let destroySession = (session) => {
    return new Promise((resolve, reject) => {
        session.destroy(err => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve();
        });
    });
};

module.exports = {
    indexGET: [
        requireStravaAuth, 
        refreshStravaToken, 
        primeStravaApi, 
        loadAthlete,
        (req, res) => {
            return res.render('account/index.njk', { athlete: req.appData.athlete });
        }
    ],

    loginGET: [redirectToRootIfLoggedIn, (req, res) => {
        let state = req.query.redirect || '/';
    
        res.render('account/login.njk', { stravaAuthUrl: req.appData.db.stravaAuth.getConnectUrl(state) });
    }],

    authGET: (req, res) => {
        let redirect = req.query.state || '/';
    
        stravaAuth.exchangeAuthorizationCodeForTokensAsync(req.query.code, req.query.scope)
        .then(req.appData.db.saveTokens)
        .then(saveTokenResult => {
            // if a fresh login, note in the session to update the athlete in loadAthlete
            req.session.updateAthlete = true;
            // put the accessToken in the session
            req.session.stravaToken = saveTokenResult.tokens.accessToken;
            res.redirect(redirect);
        });
    },

    deauthorizePOST: (req, res) => {
        deauthorize(req.session.stravaToken.code)
        .then(() => req.session)
        .then(destroySession)
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
            res.send('error');
        });
    },

    logoutPOST: (req, res) => {
        destroySession(req.session)
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
            res.send('error');
        });        
    },    

    deleteGET: [requireStravaAuth, (req, res) => {
        res.render('account/delete.njk');
    }],

    deletePOST: [requireStravaAuth, refreshStravaToken, loadAthlete, 
        (req, res) => {
            let activitiesDeletePromise = req.appData.db.activity.destroy({
                where: {
                    athleteId: req.appData.athlete.id
                }
            });

            let athleteDeletePromise = req.appData.db.athlete.destroy({
                where: {
                    id: req.appData.athlete.id
                }
            });

            let accessDeletePromise = req.appData.db.accessToken.destroy({
                where: {
                    athleteId: req.appData.athlete.id
                }
            });

            let refreshDeletePromise = req.appData.db.refreshToken.destroy({
                where: {
                    athleteId: req.appData.athlete.id
                }
            });

            let deauthPromise = deauthorize(req.session.stravaToken.code);

            Promise.all([
                activitiesDeletePromise, 
                athleteDeletePromise, 
                accessDeletePromise, 
                refreshDeletePromise, 
                deauthPromise
            ])
            .then(() => req.session)
            .then(destroySession)
            .then(() => {
                res.redirect('/');
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            });
    }]
};
