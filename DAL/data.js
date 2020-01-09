const AccessToken = require('../models/accessToken');
const RefreshToken = require('../models/refreshToken');
const Athlete = require('../models/athlete');
const Activity = require('../models/activity');


class Data {
    static init(db) {
        //AccessToken.init(sequelize,'accessToken');
        //RefreshToken.init(sequelize,'refreshToken');
        //Athlete.init(sequelize, 'athlete');
        //Activity.init(sequelize, 'activity');

        this.accessToken = db.sequelize.models.AccessToken;
        this.refreshToken = db.sequelize.models.RefreshToken;
        this.athlete = db.sequelize.models.Athlete;
        this.activity = db.sequelize.models.Activity;
        this.stravaAuth = require('./stravaAuth');
    }

    static saveTokens(tokens) {
        var atUpsertPromise = Data.accessToken.upsert(tokens.accessToken, { return: true });        
        var rtUpsertPromise = Data.refreshToken.upsert(tokens.refreshToken, { return: true });

        return Promise.all([atUpsertPromise,rtUpsertPromise]).then(values => {
            return {
                tokens,
                values
            };
        });
    }

    static updateTokens(accessTokenChanges, refreshTokenChanges, athleteId) {
        let atUpdate = Data.accessToken.update(accessTokenChanges, { where: { athleteId } });
        let rtUpdate = Data.refreshToken.update(refreshTokenChanges, { where: { athleteId } });

        return Promise.all([atUpdate, rtUpdate]).then(values => {
            return {
                accessTokenChanges,
                refreshTokenChanges,
                athleteId,
                values
            };
        });
    }
}

module.exports = Data;
