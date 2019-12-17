module.exports = (req, res, next) => {
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
