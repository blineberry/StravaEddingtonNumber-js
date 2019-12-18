let redirectToRootIfLoggedIn = (req, res, next) => {
    if (req.session.stravaToken) {
        res.redirect('/');
        return;
    }    

    next();
};

let action = (req, res) => {
    res.render('login.njk', { stravaAuthUrl: req.appData.db.stravaAuth.connectUrl });
};

module.exports = [redirectToRootIfLoggedIn, action];
