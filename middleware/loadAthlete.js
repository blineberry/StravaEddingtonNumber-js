module.exports = (req, res, next) => {
    return req.appData.db.athlete.findByPk(req.session.stravaToken.athleteId)
    .then(athlete => {
        if (athlete && !req.session.updateAthlete) {
            return athlete;
        }

        return new Promise((resolve, reject) => {
            let api = new req.strava.AthletesApi();
            api.getLoggedInAthlete((error, data, response) => {
                if (error) {
                    reject(error);
                }
                
                // From Sequelize docs: Signature for this method has been 
                // changed to Promise<Model,boolean | null>. First index 
                // contains upserted instance, second index contains a boolean 
                // (or null) indicating if record was created or updated. For 
                // SQLite/Postgres, created value will always be null.
                req.appData.db.athlete.upsert({
                    id: data.id,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    profileImageUrl: data.profile
                }).then(response => {
                    req.session.updateAthlete = false;
                    resolve(response[0]);
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
