const requireStravaAuth = require('../middleware/requireStravaAuth');
const refreshStravaToken = require('../middleware/refreshStravaToken');
const primeStravaApi = require('../middleware/primeStravaApi');
const loadAthlete = require('../middleware/loadAthlete');
const fetchNewStravaActivities = require('../middleware/fetchNewStravaActivities');

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
    primeStravaApi, 
    loadAthlete,
    fetchNewStravaActivities,
    action];
