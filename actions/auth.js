let stravaAuth = require('../DAL/stravaAuth');

module.exports = (req, res) => {
    let redirect = req.query.state || '/';

    stravaAuth.exchangeAuthorizationCodeForTokensAsync(req.query.code, req.query.scope)
    .then(req.appData.db.saveTokens)
    .then(saveTokenResult => {
        req.session.stravaToken = saveTokenResult.tokens.accessToken;
        res.redirect(redirect);
    });
};
