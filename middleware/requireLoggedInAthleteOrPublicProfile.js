module.exports = (req, res, next) => {
    if (req.appData.isLoggedInAthlete) {
        return next();
    }

    if (req.appData.athlete.isPublic) {
        return next();
    }

    res.status(403).send('Unauthorized');
};
