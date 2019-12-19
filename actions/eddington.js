module.exports = (req, res) => {
    res.render('eddington.njk', { 
        stravaAuthUrl: req.appData.db.stravaAuth.connectUrl, 
        isLoggedIn: !!req.session.stravaToken
    });
};