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
    sequelize.sync({ force: false });
}
app.use((req, res, next) => {
    if (!req.appData) {
        req.appData = {};
    }

    req.appData.db = data;
    next();
});

app.use('/static', express.static('public'));

app.get('/', actions.home);
app.get('/login', actions.login);
app.get('/auth', actions.auth);

app.post('/deauthorize', actions.deauthorize);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))