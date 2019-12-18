let getCountsFromDays = (days, includeData = false) => {
    let counts = [];

    for (let i = 0; i < days.length; i++) {
        let day = days[i];
        let distance = Math.floor(day.distance);

        for (let j = distance; j > 0; j--) {
            if (!counts[j]) {
                counts[j] = 0;
            }
    
            counts[j] += 1;
        }
    }

    if (includeData) {
        return {
            counts,
            days
        }
    }

    return counts;
};

let getENumFromCounts = (counts, includeData = false) => {
    let eNum = 0;
    
    for (let i = counts.length; i > 0; i--) {
        if (counts[i] >= i) {
            eNum = i;
            break;
        }
    }

    if (includeData) {
        return {
            eNum,
            counts
        };
    }
    return eNum;
};

let getDaysFromActivities = (activities, includeData = false) => {
    let dayIndex = {};
    let days = [];

    for (let i = 0; i < activities.length; i++) {
        let activity = activities[i];
        let day = activity.date.toDateString();
        let index = dayIndex[day];

        if (!index)
        {
            index = days.length;
            dayIndex[day] = index;
            days[index] = {
                distance: 0
            };
        }

        days[index].distance += activity.distance;
    }
    
    if (includeData) {
        return {
            days,
            activities
        }
    }
    return days;
};

let getENumFromDays = (days, includeData = false) => {
    if (includeData) {
        let countData = getCountsFromDays(days, includeData);
        let eNumData = getENumFromCounts(countData.counts, includeData);

        return { ...countData, ...eNumData };
    }

    return getENumFromCounts(getCountsFromDays(days));
};

let getENumFromActivities = (activities, includeData = false) => {
    if (includeData) {
        let daysData = getDaysFromActivities(activities, includeData);
        let eNumFromDaysData = getENumFromDays(daysData.days, includeData);

        return { ...daysData, ...eNumFromDaysData};
    }

    return getENumFromDays(getDaysFromActivities(activities));
};

module.exports = {
    getENumFromActivities,
    getCountsFromDays,
    getENumFromCounts,
    getCountsFromDays,
    getDaysFromActivities
};

/*(activities) => {
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
*/