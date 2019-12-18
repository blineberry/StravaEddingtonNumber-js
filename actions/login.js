module.exports = (req, res) => {
    let stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${ process.env.STRAVA_CLIENT_ID }&redirect_uri=${ encodeURIComponent( process.env.STRAVA_REDIRECT_DOMAIN + "/auth") }&response_type=code&scope=read,activity:read,activity:read_all`;
    res.render('login.njk', { stravaAuthUrl });
};
