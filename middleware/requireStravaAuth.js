module.exports = (req, res, next) => {
    if (!req.session.stravaToken) {
        res.redirect('/login?redirect=' + encodeURIComponent(req.path));
        return;
    }    

    next();
};
