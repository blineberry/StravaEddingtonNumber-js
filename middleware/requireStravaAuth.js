module.exports = (req, res, next) => {
    if (!req.session.stravaToken) {
        res.redirect('/login');
        return;
    }    

    next();
};
