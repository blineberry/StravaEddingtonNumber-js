const express = require('express');
const Sequelize = require('sequelize');
const session = require('express-session');
const nunjucks = require('nunjucks');
const request = require('superagent');
const data = require('../DAL/data');

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
    sequelize.sync();
}

app.get('/', (req, res) => {
    if (req.session.stravaToken) {
        res.render('index.njk');
        return;
    }

    let stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${ process.env.STRAVA_CLIENT_ID }&redirect_uri=${ encodeURIComponent("http://localhost:3000/auth") }&response_type=code&scope=read`;
    res.render('login.njk', { stravaAuthUrl });
});

app.get('/auth', (req, res) => {
    console.log(req);

    let client_id = process.env.STRAVA_CLIENT_ID, 
        client_secret = process.env.STRAVA_CLIENT_SECRET, 
        code = req.query.code, 
        grant_type = "authorization_code";

    request
        .post('https://www.strava.com/oauth/token')
        .send({
            client_id,
            client_secret,
            code,
            grant_type
        })
        .then((response) => {
            console.log(response);
                        
            data.accessToken.create({
                athleteId: response.body.athlete.id,
                //scope: response.body.athleteId,
                code: response.body.access_token,
                expiresAt: response.body.expires_at
            }).then(at => {
                req.session.stravaToken = at;
                res.redirect('/');
            });
        }, (error) => {
            console.log(error);
            res.send('error');
        })
        .catch(err => {
            console.log(err);
            res.send('error');
        });
});

app.post('/deauthorize', (req, res) => {
    request
        .post('https://www.strava.com/oauth/deauthorize')
        .send({
            access_token: req.session.stravaToken
        })
        .then((response) => {
            console.log(response);
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                    res.send('error');
                }
                res.redirect('/');
            });
        }, (error) => {
            console.log(error);
            res.send('error');
        })
        .catch(err => {
            console.log(err);
            res.send('error');
        });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))