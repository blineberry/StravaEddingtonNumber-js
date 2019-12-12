module.exports = (req, res) => {
    let stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${ process.env.STRAVA_CLIENT_ID }&redirect_uri=${ encodeURIComponent("http://localhost:3000/auth") }&response_type=code&scope=read,activity:read`;
    res.render('login.njk', { stravaAuthUrl });
};
