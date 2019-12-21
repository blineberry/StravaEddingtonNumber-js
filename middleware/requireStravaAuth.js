module.exports = (req, res, next) => {
    if (!req.session.stravaToken) {
        res.redirect('/account/login?redirect=' + encodeURIComponent(req.baseUrl + req.path));
        return;
    }    

    next();
};
