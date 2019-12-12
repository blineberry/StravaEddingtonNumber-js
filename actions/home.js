//const s;

let action = (req, res) => {
    
};

let home = (sequelize) => {
    s = sequelize;

    return (req, res) => {
        if (!req.session.athleteId) {
            res.redirect('/login');
        }
    
        if (new Date.now().getUTCDate() > req.session.accessToken.expiresAt) {
            req.session.accessToken = getRefreshedAccessToken(req.session.athleteId);
            return home(sequelize);
        }
    
        Strava.ApiClient.instance.authentications['strava_oauth'].accessToken = req.session.accessToken.code;
        let api = new Strava.AthletesApi();
        
        api.getLoggedInAthlete((error, data, response) => {
            if (error) {
                switch (response.statusCode) {
                    case 401:
                        req.session.athleteId = null;
                        return action(req, res);
                    default:
                        console.log(error);
                        console.log(response);
                        res.send('error');
                        return;
                }
            }
    
            console.log(data);
            res.render('index.njk');
            return;
        });
        return;
        if (req.session.stravaToken) {
            res.render('index.njk');
            return;
        }
    
        let stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${ process.env.STRAVA_CLIENT_ID }&redirect_uri=${ encodeURIComponent("http://localhost:3000/auth") }&response_type=code&scope=read`;
        res.render('login.njk', { stravaAuthUrl });
    }
};

module.exports = (req, res) => {
    let api = new req.strava.AthletesApi();
    api.getLoggedInAthlete((error, data, response) => {
        if (error) {
            switch (response.statusCode) {
                case 401:
                    req.session.stravaToken = null;
                    res.redirect('/');
                    return;
                default:
                    console.log(error);
                    console.log(response);
                    res.send('error');
                    return;
            }
        }

        res.render('home.njk', {data});
        return;
    });
};
