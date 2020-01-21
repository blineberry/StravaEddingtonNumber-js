const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const loadAthlete = require('../middleware/loadAthlete');

module.exports = {
    deleteAllGET: [requireStravaAuth, (req, res) => {
        res.render('activities/deleteAll.njk',{
            isLoggedIn: req.appData.isLoggedIn
        });
    }],
    deleteAllPOST: [requireStravaAuth, refreshStravaToken, loadAthlete, 
        (req, res) => {
            req.appData.db.activity.destroy({
                where: {
                    athleteId: req.appData.athlete.id
                }
            })
            .then(() => {
                return req.appData.db.athlete.update({
                    isFetching: false
                },
                {
                    where: {
                        id: req.appData.athlete.id
                    }
                });
            })
            .then(() => {
                res.redirect('/account');
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            });
    }],
    refreshPOST: [requireStravaAuth, refreshStravaToken, loadAthlete, 
        (req, res) => {
            let deleteActivitiesPromise = req.appData.db.activity.destroy({
                where: {
                    athleteId: req.appData.athlete.id
                }
            });

            let resetAthleteFetchTimePromise = req.appData.db.athlete.update({
                activityFetchTime: 0
            }, {
                where: {
                    id: req.appData.athlete.id
                }
            });

            Promise.all([deleteActivitiesPromise,resetAthleteFetchTimePromise])
            .then(() => {
                res.redirect('/');
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            });
    }]
};
