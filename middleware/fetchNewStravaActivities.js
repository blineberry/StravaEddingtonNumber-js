let getActivities = (activitiesApi, before, after, activities = [], page = 1, callback) => {
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

let getPromisedActivities = (activitiesApi, before, after, activities, page, callback) => {
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

module.exports = (req, res, next) => {
    // If an athlete is not logged in, continue.
    if (!req.appData.loggedInAthlete) {
        return next();
    }

    // If no requested athlete, continue.
    if (!req.appData.athlete) {
        return next();
    }

    // If the requested Athlete is not the Logged in Athlete, continue.
    if (req.appData.athlete.id !== req.appData.loggedInAthlete.id) {
        return next();
    }

    // If the logged in user is viewing their own page, fetch their activities.
    let fetchTime = Math.floor(Date.now() / 1000);
    let athlete = req.appData.loggedInAthlete;
    
    let stravaActivitiesPromise = new Promise((resolve) => resolve());
    
    if (!athlete.isFetching) {
        athlete.isFetching = true;
        let tempPromise = req.appData.db.athlete.update({
            isFetching: athlete.isFetching                    
        }, {
            where: {
                id: athlete.id,
            }
        })
        .then(() => {
            return getPromisedActivities(new req.strava.ActivitiesApi(), fetchTime, athlete.activityFetchTime);
        })
        .then((activities) => {
            return req.appData.db.activity.bulkCreate(activities.map(a => {
                return {
                    id: a.id,
                    athleteId: a.athlete.id,
                    startDate: a.startDate,
                    distance: a.distance,
                    type: a.type
                };
            }));
        })
        .then(activities => {
            athlete.isFetching = false;

            let updateFields = {
                isFetching: athlete.isFetching
            };

            if (activities.length > 0) {
                let lastFetchedActivityTimes = activities.map(a => new Date(a.startDate).getTime() / 1000).sort((a,b) => b - a);
                updateFields.activityFetchTime = lastFetchedActivityTimes[0];
            }

            return req.appData.db.athlete.update(updateFields, {
                where: {
                    id: athlete.id
                }
            });
        })
        .catch(error => {
            console.log(error);
            athlete.isFetching = false;
            req.appData.db.athlete.update({
                isFetching: athlete.isFetching,
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

    return stravaActivitiesPromise
    .then(() => {
        next();
        return;
    });
};
