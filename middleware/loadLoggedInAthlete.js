module.exports = (req, res, next) => {
    req.appData.loggedInAthlete = null;
    
    if (!req.session || !req.session.stravaToken) {
        return next();
    }

    req.appData.db.athlete.findByPk(req.session.stravaToken.athleteId)
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
                })
                .then(athlete => {
                    resolve(athlete);
                })
                .catch(next);
            });  
        });
    })
    .then(athlete => {
        req.appData.loggedInAthlete = athlete;
        next();
        return;    
    })
    .catch(next);
};
