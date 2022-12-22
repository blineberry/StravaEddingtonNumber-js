const Strava = require('strava_api_v3');

module.exports = (req, res, next) => {
    // If we don't have a stravaToken, the user is not logged in. Continue.
    if (!req.session.stravaToken) {
        return next();
    }
    
    Strava.ApiClient.instance.authentications['strava_oauth'].accessToken = req.session.stravaToken.code;
    req.strava = Strava;

    next();
};
