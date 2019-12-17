module.exports = (req, res, next) => {
    let utcNow = Date.now();

    if (new Date() < new Date(req.session.stravaToken.expiresAt)) {
        next();
        return;
    }

    let tokenChangesPromise = data.refreshToken.findByPk(req.session.stravaToken.athleteId)
        .then(refreshToken => {
            return stravaAuth.getRefreshedAccessToken(refreshToken.code);
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
        });
};