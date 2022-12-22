const express = require('express');
const Sequelize = require('sequelize');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const { createClient } = require('redis');
const nunjucks = require('nunjucks');

const data = require('./DAL/data');
const indexRouter = require('./routes/index');
const accountRouter = require('./routes/account');
const activitiesRouter = require('./routes/activities');
const athletesRouter = require('./routes/athletes');
const dbConfig = require('./dbconfig.js');

const app = express();
const port = process.env.PORT;

// setup view engine
nunjucks.configure('views', {
    express: app
});

// Force https if on Heroku
app.use((req, res, next) => {
    if (process.env.HEROKU_SSL !== "force") {
        return next();
    }

    let proto = req.get('X-Forwarded-Proto');

    if (proto === 'https') {
        return next();
    }

    if (req.method === 'GET') {
        return res.redirect(301, ['https://', req.get('Host'), req.url].join(''));
    }

    return res.status(403).send('HTTPS Required');
});


// If development, use the in-memory session store
let sessionConfig = {
    secret: process.env.SESSION_SECRET.split(',')
};

// Can't get redis to work in prod, so keep using in-memory store.
/*
if (process.env.NODE_ENV !== "development") {
    let redisClient = createClient({ legacyMode: true });
    redisClient.connect().catch(console.error);

    console.log(redisClient);

    sessionConfig = {
        store: new RedisStore({ client: redisClient }),
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET.split(','),
        //secure: process.env.NODE_ENV === "development" ? false : true,
        //name: 'connect.sid.strava',
        resave: false,
    };
}*/

// setup session
app.use(session(sessionConfig));

let dbInitialized = false;

// initialize db
const sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.pass, dbConfig.options);
data.init(sequelize);
sequelize.authenticate()
.then(() => {
    console.log('Connected');     
    dbInitialized = true;   
})
.catch(err => {
    console.log(err);
});

// send a sensible response if db connection failed
app.use((req,res,next) => {
    if (dbInitialized) {
        next();
        return;
    }

    res.status(503).send("Unable to connect to database");
});

if (process.env.NODE_ENV === "development") {
    sequelize.sync({ force: false });
}

// get the db into the pipeline
app.use((req, res, next) => {
    if (!req.appData) {
        req.appData = {};
    }

    req.appData.loginUrl = '/account/login?redirect=' + encodeURIComponent(req.baseUrl + req.path);

    req.appData.db = data;
    next();
});

// serve static files
app.use('/static', express.static('public'));

app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/activities', activitiesRouter);
app.use('/athletes', athletesRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
