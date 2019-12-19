let redirectToRootIfLoggedIn = (req, res, next) => {
    if (req.session.stravaToken) {
        res.redirect('/');
        return;
    }    

    next();
};

let action = (req, res) => {
    let state = req.query.redirect || '/';

    res.render('login.njk', { stravaAuthUrl: req.appData.db.stravaAuth.getConnectUrl(state) });
};

module.exports = [redirectToRootIfLoggedIn, action];
