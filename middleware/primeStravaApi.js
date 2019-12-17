const Strava = require('strava_api_v3');

module.exports = (req, res, next) => {
    Strava.ApiClient.instance.authentications['strava_oauth'].accessToken = req.session.stravaToken.code;
    req.strava = Strava;

    next();
};
