const request = require('superagent');

module.exports = (req, res) => {
    request
        .post('https://www.strava.com/oauth/deauthorize')
        .send({
            access_token: req.session.stravaToken.code
        })
        .then((response) => {
            console.log(response);
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                    res.send('error');
                }
                res.redirect('/');
            });
        }, (error) => {
            console.log(error);
            res.send('error');
        })
        .catch(err => {
            console.log(err);
            res.send('error');
        });
}
