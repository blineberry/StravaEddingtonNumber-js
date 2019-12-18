const request = require('superagent');
const tokenEndpoint = 'https://www.strava.com/oauth/token';

module.exports = {
    exchangeAuthorizationCodeForTokensAsync(authorizationCode, scope) {
        return request
            .post(tokenEndpoint)
            .send({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                code: authorizationCode,
                grant_type: "authorization_code",
            })
            .then(response => {
                let accessToken = {
                    athleteId: response.body.athlete.id,
                    scope: scope,
                    code: response.body.access_token,
                    expiresAt: new Date(response.body.expires_at * 1000)
                };
                let refreshToken = {
                    athleteId: response.body.athlete.id,
                    scope: scope,
                    code: response.body.refresh_token,
                };

                return {
                    accessToken,
                    refreshToken
                };
            })
            .catch(error => {
                console.log(error);
                throw error;
            });
    },
    getRefreshedAccessToken: (refreshToken) => {
        return request
            .post(tokenEndpoint)
            .send({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            });
    }
};
