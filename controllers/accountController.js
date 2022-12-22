const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const primeStravaApi = require('../middleware/primeStravaApi');
const loadAthlete = require('../middleware/loadAthlete');
let stravaAuth = require('../DAL/stravaAuth');
const request = require('superagent');
const fetchNewStravaActivities = require('../middleware/fetchNewStravaActivities');

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
            return res.render('account/index.njk', { athlete: req.appData.loggedInAthlete });
        }
    ],

    loginGET: [redirectToRootIfLoggedIn, (req, res) => {
        let returnUrl = req.query.redirect || '/';

        res.render('account/login.njk', { 
            stravaAuthUrl: req.appData.db.stravaAuth.getConnectUrl(req, returnUrl),
         });
    }],

    authGET: (req, res) => {
        // Get the session nonce and remove so it can't be reused.
        let nonce = req.session.stravaAuthNonce;
        req.session.stravaAuthNonce = undefined;

        // Don't continue if state is missing.
        if (!req.query.state) {
            res.status(400).send('State missing from request.');
        }

        let state = JSON.parse(Buffer.from(req.query.state, 'base64').toString());

        // Don't continue if nonce is missing
        if (!state.nonce) {
            res.status(400).send('Nonce missing from request.');
        }

        // Don't continue if nonce doesn't match.
        if (state.nonce !== nonce) {
            res.status(400).send('Nonce does not match.');
        }

        let redirect = state.returnUrl || '/';

        // Don't allow an open redirect
        if (redirect[0] !== "/" && !redirect.startsWith(`${ req.protocol }://${ req.hostname }`)) {
            res.status(400).send('Invalid redirect');
        }
    
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
                    athleteId: req.appData.loggedInAthlete.id
                }
            });

            let athleteDeletePromise = req.appData.db.athlete.destroy({
                where: {
                    id: req.appData.loggedInAthlete.id
                }
            });

            let accessDeletePromise = req.appData.db.accessToken.destroy({
                where: {
                    athleteId: req.appData.loggedInAthlete.id
                }
            });

            let refreshDeletePromise = req.appData.db.refreshToken.destroy({
                where: {
                    athleteId: req.appData.loggedInAthlete.id
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
    }],
    makePublicPOST: [requireStravaAuth, refreshStravaToken, loadAthlete,
        (req,res) => {
            req.appData.db.athlete.update({
                isPublic: true
            }, {
                where: {
                    id: req.appData.loggedInAthlete.id,
                }
            }).then(() => {
                res.redirect('/athletes/' + req.appData.loggedInAthlete.id);
            });            
    }],
    makePrivatePOST: [requireStravaAuth, refreshStravaToken, loadAthlete,
        (req,res) => {
            req.appData.db.athlete.update({
                isPublic: false
            }, {
                where: {
                    id: req.appData.loggedInAthlete.id,
                }
            }).then(() => {
                res.redirect('/athletes/' + req.appData.loggedInAthlete.id);
            });            
    }]
};
