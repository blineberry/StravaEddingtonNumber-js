const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const primeStravaApi = require('../middleware/primeStravaApi');
const loadAthlete = require('../middleware/loadAthlete');
const fetchNewStravaActivities = require('../middleware/fetchNewStravaActivities');
const eddington = require('../eddington');

let action = (req, res) => {
    req.appData.db.activity.findAll({
        where: {
            athleteId: req.appData.athlete.id
        }
    })
    .then(activities => {
        let activityTypes = activities.map(a => a.type).filter((v,i,a) => {
            return i === a.indexOf(v);
        });
        let eddingtonNumbers = [];

        for (let i = 0; i < activityTypes.length; i++) {
            let type = activityTypes[i];
            eddingtonNumbers.push({
                type: type,
                eNum: eddington.getENumFromActivities(activities.filter(a => a.type === type).map(a => {
                    return {
                        distance: a.distance / 1609.344,
                        date: a.startDate
                    };
                })),
            });
        }

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
    primeStravaApi, 
    loadAthlete,
    fetchNewStravaActivities,
    action];
