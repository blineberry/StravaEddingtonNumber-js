const express = require('express');
const Sequelize = require('sequelize');
const session = require('express-session');
const nunjucks = require('nunjucks');

const data = require('./DAL/data');
const actions = require('./actions');
const dbConfig = require('./dbconfig.js');

const app = express();
const port = process.env.PORT;

nunjucks.configure('views', {
    express: app
});

const sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.pass, dbConfig.options);

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