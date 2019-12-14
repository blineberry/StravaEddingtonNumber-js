const express = require('express');
const Sequelize = require('sequelize');
const session = require('express-session');
const nunjucks = require('nunjucks');
const request = require('superagent');
const data = require('../DAL/data');
const Strava = require('strava_api_v3');
const actions = require('../actions');
const stravaAuth = require('../DAL/stravaAuth');

const app = express();
const port = process.env.PORT;

nunjucks.configure('views', {
    express: app
});

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    dialect: 'mssql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    encrypt: true,
    dialectOptions: { 
      options: {
        encrypt: true
      }
    },
    retry: {
        match: [
            Sequelize.TimeoutError,
            Sequelize.ConnectionError,
            Sequelize.ConnectionTimedOutError
        ],
        max: 3
    }
});

app.use(session({
    secret: process.env.SESSION_SECRET.split(','),
    secure: process.env.NODE_ENV === "development" ? false : true,
    name: 'connect.sid.strava',
    resave: false,
    saveUninitialized: false
}));

data.init(sequelize);

sequelize.authenticate()
    .then(() => {
        console.log('Connected');        
    })
    .catch(err => {
        console.log(err);
    });


if (process.env.NODE_ENV === "development") {
    sequelize.sync({ force: true });
}

app.use((req, res, next) => {
    req.data = data;
    next();
})

let requireStravaAuth = (req, res, next) => {
    if (!req.session.stravaToken) {
        res.redirect('/login');
        return;
    }    

    next();
}

let refreshStravaToken = (req, res, next) => {
    let utcNow = Date.now();

    if (new Date() < new Date(req.session.stravaToken.expiresAt)) {
        next();
        return;
    }

    let tokenChangesPromise = data.refreshToken.findByPk(req.session.stravaToken.athleteId)
        .then(refreshToken => {
            return stravaAuth.getRefreshedAccessToken(refreshToken.code);
        })
        .then(response => {
            return {
                accessTokenChanges:{
                    code: response.body.access_token,
                    expiresAt: new Date(response.body.expires_at * 1000)
                },
                refreshTokenChanges:{
                    code: response.body.refresh_token
                },
            };
        });

    let saveTokenPromise = tokenChangesPromise
        .then(changes => {
            return req.data.updateTokens(
                changes.accessTokenChanges, 
                changes.refreshTokenChanges, 
                req.session.stravaToken.athleteId
            );
        });

    Promise.all([tokenChangesPromise, saveTokenPromise])
        .then(([tokenChangesResult, saveTokenResult]) => {
            req.session.stravaToken.code = tokenChangesResult.accessTokenChanges.code;
            req.session.stravaToken.expiresAt = tokenChangesResult.accessTokenChanges.expiresAt;
            next();
        });
};

let stravaApiPrime = (req, res, next) => {
    Strava.ApiClient.instance.authentications['strava_oauth'].accessToken = req.session.stravaToken.code;
    req.strava = Strava;

    next();
}

app.get('/', [requireStravaAuth, refreshStravaToken, stravaApiPrime], actions.home);
app.get('/login', actions.login);
app.get('/auth', actions.auth);

app.post('/deauthorize', actions.deauthorize);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))