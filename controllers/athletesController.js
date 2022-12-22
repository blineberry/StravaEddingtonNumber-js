const refreshStravaToken = require('../middleware/refreshStravaToken');
const primeStravaApi = require('../middleware/primeStravaApi');
const loadAthlete = require('../middleware/loadAthlete');
const fetchNewStravaActivities = require('../middleware/fetchNewStravaActivities');
const eddington = require('../eddington');
const requireStravaAuth = require('../middleware/requireStravaAuth');

let authenticateRequest = (req, res, next) => {
    req.appData.db.athlete.findByPk(req.params.id).then(athlete => {
        // Assign the fetched athlete to the request.
        req.appData.athlete = athlete;

        // If the requested athlete is public, no need to authenticate.
        if (athlete.isPublic) {
            return next();
        }        

        // If the athlete is not logged in, redirect to login page.
        if (!req.appData.loggedInAthlete) {
            return requireStravaAuth(req,res,next);
        }

        // If logged in. Continue.
        next();
    });
}

let authorizeRequest = async (req, res, next) => {    
    // If the requested athlete is public, the user is authorized.
    if (req.appData.athlete.isPublic) {
        return next();
    }

    // If the athlete account is private and the logged in athlete is
    // the requested athlete, the user is authorized.
    if (req.appData.athlete.id === req.appData.loggedInAthlete?.id) {
        return next();
    }
    
    // Otherwise the user is not authorized.
    return res.status(403).send();
}

let getDescription = function(athlete, eddingtonNumbers) {
    let numbers = eddingtonNumbers.sort(sortEddingtonNumbers);

    let description = `${ athlete.firstname } ${ athlete.lastname }'s Eddington numbers are: `;

    for (let i = 0; i < numbers.length; i++) {
        // Stop if we've hit 0 numbers.
        if (numbers[i].eNum === 0) {
            break;
        }

        // Add a comma after the first one
        if (i > 0) {
            description += ", "
        }

        description += `${ numbers[i].type } ${ numbers[i].eNum }`
    }

    description += '.';

    return description;
};

let sortEddingtonNumbers = function(a,b) {
    return b.eNum - a.eNum;
};

let getShareText = function(eddingtonNumbers) {
    let numbers = eddingtonNumbers.sort(sortEddingtonNumbers);

    let shareText = `Check out my Eddington numbers!`;

    for (let i = 0; i < numbers.length; i++) {
        // Stop if we've hit 0 numbers.
        if (numbers[i].eNum === 0) {
            break;
        }

        // Double space for the first one.
        if (i === 0) {
            shareText += "\n"
        }

        shareText += `\n${ numbers[i].type }: ${ numbers[i].eNum } `
    }

    shareText += "\n"
    return shareText;
};

let detailsGET = async (req, res) => {
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

        let title = `${req.appData.athlete.firstname} ${req.appData.athlete.lastname}'s Eddington Numbers`;
        let description = getDescription(req.appData.athlete, eddingtonNumbers);

        res.render('athletes/details.njk', {
            loggedInAthlete: req.appData.loggedInAthlete,
            athlete: req.appData.athlete,
            eddingtonNumbers,
            activityCount: activities.length,
            title,
            isLoggedInAthlete: req.appData.athlete.id === req.appData.loggedInAthlete?.id,
            isLoggedIn: !!req.appData.loggedInAthlete,
            loginUrl: req.appData.loginUrl,
            meta: {
                canonicalUrl: `${ req.protocol }://${ req.hostname }/athletes/${ req.appData.athlete.id }`,
                description
            },
            socialMeta: {
                type: 'profile',
                card: "summary",
                siteName: "Eddington Numbers | Orange Gnome",
                image: req.appData.athlete.profileImageUrl,
                imageAlt: `Strava profile picture of ${ req.appData.athlete.firstname } ${ req.appData.athlete.lastname }`
            }, 
            share: {
                text: getShareText(eddingtonNumbers)
            }
        });
    })
    .catch(error => {
        console.log(error);
        res.send('error');
    });
};

module.exports = {
    detailsGET: [
        refreshStravaToken,
        primeStravaApi,
        loadAthlete,
        authenticateRequest,
        authorizeRequest,
        fetchNewStravaActivities,
        detailsGET]
};