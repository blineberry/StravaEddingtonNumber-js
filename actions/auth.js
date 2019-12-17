let stravaAuth = require('../DAL/stravaAuth');

module.exports = (req, res) => {
    stravaAuth.exchangeAuthorizationCodeForTokensAsync(req.query.code, req.query.scope)
    .then(req.appData.db.saveTokens)
    .then(saveTokenResult => {
        req.session.stravaToken = saveTokenResult.tokens.accessToken;
        res.redirect('/');
    });
};
