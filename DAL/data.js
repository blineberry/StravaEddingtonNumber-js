var AccessToken = require('../models/accessToken');
var RefreshToken = require('../models/refreshToken');

class Data {
    static init(sequelize) {
        AccessToken.init(sequelize,'accessToken');
        RefreshToken.init(sequelize,'refreshToken');

        this.accessToken = AccessToken;
        this.refreshToken = RefreshToken;
    }
}

module.exports = Data;
