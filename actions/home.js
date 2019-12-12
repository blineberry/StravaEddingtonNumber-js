function getActivities(activitiesApi, activities, page, callback) {
    return activitiesApi.getLoggedInAthleteActivities({
        page,
        perPage: 200
    }, (error, data, response) => {
        if (error) {
            callback(error, data, response);
            return;
        }

        if (data.length === 0) {
            callback (error, activities, response);
            return;
        }

        return getActivities(activitiesApi, activities.concat(data), page += 1, callback);
    });
}

module.exports = (req, res) => {
    let athletesApi = new req.strava.AthletesApi();
    let activitiesApi = new req.strava.ActivitiesApi();
    let athletePromise = new Promise((resolve, reject) => {
        athletesApi.getLoggedInAthlete((error, data, response) => {
            if (error) {
                switch (response.statusCode) {
                    case 401:
                        req.session.stravaToken = null;
                        res.redirect('/');
                        return;
                    default:
                        console.log(error);
                        console.log(response);
                        reject(error);
                        return;
                }
            }

            resolve(data);
        });
    });

    let activitiesPromise = new Promise((resolve, reject) => {
        getActivities(activitiesApi, [], 1, (error, data, response) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(data);
        });
    });

    Promise.all([athletePromise, activitiesPromise])
    .then(([athleteResult, activitiesResult]) => {
        res.render('home.njk', {
            athlete: athleteResult,
            activities: activitiesResult
        });
    })
    .catch((error) => {
        res.send(JSON.stringify(error.response.body.errors));
    });
};
