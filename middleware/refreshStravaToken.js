module.exports = (req, res, next) => {
    // if we don't have a stravaToken, we're not logged in. Continue.
    if (!req.session.stravaToken) {
        return next();
    }

    let utcNow = Date.now();

    if (new Date() < new Date(req.session.stravaToken.expiresAt)) {
        next();
        return;
    }

    let tokenChangesPromise = req.appData.db.refreshToken.findByPk(req.session.stravaToken.athleteId)
        .then(refreshToken => {
            return req.appData.db.stravaAuth.getRefreshedAccessToken(refreshToken.code);
        })
        .then(response => {
            return {
                accessTokenChanges:{
                    code: response.body.access_token,
                    expiresAt: new Date(response.body.expires_at * 1000)
                },
                refreshTokenChanges:{
                    code: response.body.refresh_token
                },
            };
        });

    let saveTokenPromise = tokenChangesPromise
        .then(changes => {
            return req.appData.db.updateTokens(
                changes.accessTokenChanges, 
                changes.refreshTokenChanges, 
                req.session.stravaToken.athleteId
            );
        });

    Promise.all([tokenChangesPromise, saveTokenPromise])
        .then(([tokenChangesResult, saveTokenResult]) => {
            req.session.stravaToken.code = tokenChangesResult.accessTokenChanges.code;
            req.session.stravaToken.expiresAt = tokenChangesResult.accessTokenChanges.expiresAt;
            next();
        })
        .catch(err => {
            console.log(err);
            res.send('error');
        });
};
