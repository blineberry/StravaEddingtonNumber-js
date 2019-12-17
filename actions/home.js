const Strava = require('strava_api_v3');

let requireStravaAuth = (req, res, next) => {
    if (!req.session.stravaToken) {
        res.redirect('/login');
        return;
    }    

    next();
}

let refreshStravaToken = (req, res, next) => {
    let utcNow = Date.now();

    if (new Date() < new Date(req.session.stravaToken.expiresAt)) {
        next();
        return;
    }

    let tokenChangesPromise = data.refreshToken.findByPk(req.session.stravaToken.athleteId)
        .then(refreshToken => {
            return stravaAuth.getRefreshedAccessToken(refreshToken.code);
        })
        .then(response => {
            return {
                accessTokenChanges:{
                    code: response.body.access_token,
                    expiresAt: new Date(response.body.expires_at * 1000)
                },
                refreshTokenChanges:{
                    code: response.body.refresh_token
                },
            };
        });

    let saveTokenPromise = tokenChangesPromise
        .then(changes => {
            return req.appData.db.updateTokens(
                changes.accessTokenChanges, 
                changes.refreshTokenChanges, 
                req.session.stravaToken.athleteId
            );
        });

    Promise.all([tokenChangesPromise, saveTokenPromise])
        .then(([tokenChangesResult, saveTokenResult]) => {
            req.session.stravaToken.code = tokenChangesResult.accessTokenChanges.code;
            req.session.stravaToken.expiresAt = tokenChangesResult.accessTokenChanges.expiresAt;
            next();
        });
};

let stravaApiPrime = (req, res, next) => {
    Strava.ApiClient.instance.authentications['strava_oauth'].accessToken = req.session.stravaToken.code;
    req.strava = Strava;

    next();
}

let loadAthlete = (req, res, next) => {
    return req.appData.db.athlete.findByPk(req.session.stravaToken.athleteId)
    .then(athlete => {
        if (athlete) {
            return athlete;
        }

        return new Promise((resolve, reject) => {
            let api = new req.strava.AthletesApi();
            api.getLoggedInAthlete((error, data, response) => {
                if (error) {
                    reject(error);
                }
                
                req.appData.db.athlete.create({
                    id: data.id,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    profileImageUrl: data.profile
                }).then(athlete => {
                    resolve(athlete);
                });
            });  
        });
              
    })
    .then(athlete => {
        req.appData.athlete = athlete;
        next();
        return athlete;
    })
    .catch(error => {
        res.send(error);
        console.log(error);
    });    
};

let fetchNewStravaActivities = (req, res, next) => {
    let fetchTime = Math.floor(Date.now() / 1000);
    let athlete = req.appData.athlete;
    
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
                }
            }));
        })
        .then(() => {
            athlete.isFetching = false;
            return req.appData.db.athlete.update({
                isFetching: athlete.isFetching,
                activityFetchTime: fetchTime
            }, {
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

function calculateEddingtonNumbers(activities) {
    let counts = {};
    let activityDays = [];
    let dayIndex = {};

    for (let i = 0; i < activities.length; i++) {
        let activity = activities[i];
        let day = activity.startDate.toDateString();
        let indexKey = activity.type + day;
        let index = dayIndex[indexKey];

        if (!index)
        {
            index = activityDays.length;
            dayIndex[indexKey] = index;
            activityDays[index] = {
                type: activity.type,
                distance: 0,
                day: day
            };
        }

        activityDays[index].distance += activity.distance;
    }

    for (let i = 0; i < activityDays.length; i++) {
        let activityDay = activityDays[i];
        let type = activityDay.type;

        if (!counts[type]) {
            counts[type] = {
                eNum: 0
            };
        }

        let miles = Math.floor(activityDay.distance / 1609.344);

        if (miles < counts[type].eNum) {
            continue;
        }        

        for (let j = miles; j > counts[type].eNum; j--) {
            if (!counts[type][j]) {
                counts[type][j] = 0;
            }
    
            counts[type][j] += 1;

            if (type === "Run" && j === 12) {
                console.log(activityDay.day);
            }

            if (counts[type][j] >= j) {
                counts[type].eNum = j;
                break;
            }
        }
    }

    let countsAsArray = [];
    for(var key in counts) {
        if(!counts.hasOwnProperty(key)) {
            continue;
        }

        countsAsArray.push({
            type: key,
            eNum: counts[key].eNum
        });
    }
    return countsAsArray;
};

let action = (req, res) => {
    req.appData.db.activity.findAll({
        where: {
            athleteId: req.appData.athlete.id
        }
    })
    .then(activities => {
        let eddingtonNumbers = calculateEddingtonNumbers(activities);

        res.render('home.njk', {
            athlete: req.appData.athlete, 
            eddingtonNumbers,
            activityCount: activities.length,
        });
    })
    .catch(error => {
        console.log(error);
        res.send('error');
    });
};

module.exports = [
    requireStravaAuth, 
    refreshStravaToken, 
    stravaApiPrime, 
    loadAthlete,
    fetchNewStravaActivities,
    action];
