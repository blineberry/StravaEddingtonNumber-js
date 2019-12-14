function getActivities(activitiesApi, before, after, activities = [], page = 1, callback) {
    activitiesApi.getLoggedInAthleteActivities({
        page,
        perPage: 200,
        before,
        after,
    }, (error, data, response) => {
        if (error) {
            callback(error, activities, response);
            return;
        }

        if (data.length === 0) {
            callback(error, activities, response);
            return;
        }

        return getActivities(activitiesApi, before, after, activities.concat(data), page += 1, callback);
    });
}

function getPromisedActivities(activitiesApi, before, after, activities, page, callback) {
    return new Promise((resolve, reject) => {
        getActivities(activitiesApi, before, after, activities, page, (error, data, response) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(data);
        })
    });
}

function getAthlete(strava) {
    return new Promise((resolve, reject) => {
        let api = new strava.AthletesApi();
        api.getLoggedInAthlete((error, data, response) => {
            if (error) {
                reject(error);
                return;
            }
            
            resolve(data);
        });
    });
}

module.exports = (req, res) => {
    let fetchTime = Math.floor(Date.now() / 1000);

    getAthlete(req.strava)
    .then((athlete) => {
        appAthlete = {
            id: athlete.id,
            firstname: athlete.firstname,
            lastname: athlete.lastname,
            profileImageUrl: athlete.profile
        }

        return req.data.athlete.upsert(appAthlete)
        .then(() => req.data.athlete.findByPk(athlete.id));
    })
    .then(athlete => {
        let stravaActivitiesPromise = new Promise((resolve) => resolve());
        let isFetching = athlete.isFetching;

        if (!athlete.isFetching) {
            isFetching = true;
            let tempPromise = req.data.athlete.update({
                isFetching                    
            }, {
                where: {
                    id: athlete.id,
                }
            })
            .then(() => {
                return getPromisedActivities(new req.strava.ActivitiesApi(), fetchTime, athlete.activityFetchTime);
            })
            .then((activities) => {
                return req.data.activity.bulkCreate(activities.map(a => {
                    return {
                        id: a.id,
                        athleteId: a.athlete.id,
                        startDate: a.startDate,
                        distance: a.distance,
                        type: a.type
                    }
                }));
            })
            .then(() => {
                isFetching = false;
                return req.data.athlete.update({
                    isFetching,
                    activityFetchTime: fetchTime
                }, {
                    where: {
                        id: athlete.id
                    }
                });
            })
            .catch(error => {
                console.log(error);
                isFetching = false;
                req.data.athlete.update({
                    isFetching,
                    fetchTime: 0
                }, {
                    where: {
                        id: athlete.id
                    }
                }).then(() => {
                    res.send(error);
                });                
            });

            if (!athlete.isFetchTimeTooLong) {
                stravaActivitiesPromise = tempPromise;
            }
        }

        stravaActivitiesPromise
        .then(() => {
            return req.data.activity.findAll({
                where: {
                    athleteId: athlete.id
                }
            })
        })
        .then(activities => {
            res.render('home.njk', {
                athlete, 
                activities, 
                isFetching,
            });
        })
        .catch(error => {
            console.log(error);
            res.send('error');
        });
    })
    .catch(error => {
        console.log(error);
        res.send('error');
    });
};
