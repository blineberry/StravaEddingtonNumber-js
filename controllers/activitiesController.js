const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const loadAthlete = require('../middleware/loadAthlete');

module.exports = {
    deleteAllGET: [requireStravaAuth, (req, res) => {
        res.render('activities/deleteAll.njk');
    }],
    deleteAllPOST: [requireStravaAuth, refreshStravaToken, loadAthlete, 
        (req, res) => {
            req.appData.db.activity.destroy({
                where: {
                    athleteId: req.appData.athlete.id
                }
            })
            .then(() => {
                res.redirect('/account');
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            });
    }]
};
