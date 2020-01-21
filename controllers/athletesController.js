const eddington = require('../eddington');
const loadLoggedInAthlete = require('../middleware/loadLoggedInAthlete');

let handleLoggedInAthlete = (req, res, next) => {
    if (req.params.id === req.appData.athlete.id) {

    }
}

let detailsGET = (req, res, next) => {
    let athletePromise = req.appData.db.athlete.findByPk(req.params.id);

    let activitiesPromise = req.appData.db.activity.findAll({
        where: {
            athleteId: req.params.id
        }
    })
    .then(activities => {
        let activityTypes = activities.map(a => a.type).filter((v,i,a) => {
            return i === a.indexOf(v);
        });
        let eddingtonNumbers = [];

        for (let i = 0; i < activityTypes.length; i++) {
            let type = activityTypes[i];
            let eNumData = eddington.getENumFromActivities(activities.filter(a => a.type === type).map(a => {
                return {
                    distance: a.distance / 1609.344,
                    date: a.startDate
                };
            }), true);

            let nextENum = eNumData.eNum + 1;
            let nextENumCount = eNumData.counts[nextENum];

            if (!nextENumCount) {
                nextENumCount = 0;
            }

            eddingtonNumbers.push({
                type: type,
                eNum: eNumData.eNum,
                eNumCount: eNumData.counts[eNumData.eNum],
                nextENum,
                nextENumDelta: nextENum - nextENumCount,
                count: eNumData.activities.length
            });
        }

        return {
            eddingtonNumbers,
            activityCount: activities.length,
        };
    })
    .catch(error => {
        console.log(error);
        res.send('error');
    });

    Promise.all([athletePromise,activitiesPromise])
    .then(values => {
        res.render('athletes/details.njk', {
            athlete: values[0],
            ...values[1],
            isLoggedInUser: req.appData.isLoggedInUser
        });
    })
    .catch(next);
};

module.exports = {
    detailsGET: [
        (req, res, next) => {
            req.params.id = parseInt(req.params.id, 10);
            next();
        },
        loadLoggedInAthlete,
        (req, res, next) => {
            req.appData.db.athlete.findByPk(req.params.id)
            .then(athlete => {
                req.appData.requestedAthlete = athlete;
                next();
                return athlete;
            })
            .catch(next);
        },        
        (req, res, next) => {
            if (!req.appData.requestedAthlete) {
                return res.status(404).send('Athlete not found');
            }

            let isLoggedInAthlete = false;
            if (req.appData.loggedInAthlete && req.appData.loggedInAthlete.id === req.appData.requestedAthlete.id) {
                isLoggedInAthlete = true;
            }

            if (!req.appData.requestedAthlete.isPublic && !isLoggedInAthlete) {
                return res.status(403).send('This athlete is private.');
            }

            req.appData.db.activity.findAll({
                where: {
                    athleteId: req.appData.requestedAthlete.id
                }
            })
            .then(activities => {
                let activityTypes = activities.map(a => a.type).filter((v,i,a) => {
                    return i === a.indexOf(v);
                });
                let eddingtonNumbers = [];
        
                for (let i = 0; i < activityTypes.length; i++) {
                    let type = activityTypes[i];
                    let eNumData = eddington.getENumFromActivities(activities.filter(a => a.type === type).map(a => {
                        return {
                            distance: a.distance / 1609.344,
                            date: a.startDate
                        };
                    }), true);
        
                    let nextENum = eNumData.eNum + 1;
                    let nextENumCount = eNumData.counts[nextENum];
        
                    if (!nextENumCount) {
                        nextENumCount = 0;
                    }
        
                    eddingtonNumbers.push({
                        type: type,
                        eNum: eNumData.eNum,
                        eNumCount: eNumData.counts[eNumData.eNum],
                        nextENum,
                        nextENumDelta: nextENum - nextENumCount,
                        count: eNumData.activities.length
                    });
                }
        
                return {
                    eddingtonNumbers,
                    activityCount: activities.length,
                };
            })
            .then(values => {
                res.render('athletes/details.njk', {
                    athlete: req.appData.requestedAthlete,
                    ...values,
                    isLoggedInAthlete,
                    isLoggedIn: req.appData.isLoggedIn,
                });
            })
            .catch(next);
        },
    ],
};
