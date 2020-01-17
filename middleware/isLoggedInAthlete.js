module.exports = (req, res, next) => {
    req.appData.isLoggedInAthlete = false;

    if (!req.session) {        
        return next();
    }

    if (!req.session.stravaToken) {
        return next();
    }

    if (typeof req.params.id === 'undefined') {
        return next();
    }

    req.appData.isLoggedInAthlete = req.params.id === req.session.stravaToken.athleteId;
    next();
};
