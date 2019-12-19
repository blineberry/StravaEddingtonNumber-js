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
