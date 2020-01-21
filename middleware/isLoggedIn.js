module.exports = (req, res, next) => {
    req.appData.isLoggedIn = !!req.session.stravaToken;
    next();
};