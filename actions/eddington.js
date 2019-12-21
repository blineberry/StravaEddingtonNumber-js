module.exports = (req, res) => {
    res.render('eddington.njk', { 
        stravaAuthUrl: req.appData.db.stravaAuth.getConnectUrl(), 
        isLoggedIn: !!req.session.stravaToken
    });
};