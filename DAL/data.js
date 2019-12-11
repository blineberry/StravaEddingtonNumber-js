var AccessToken = require('../models/accessToken');

class Data {
    static init(sequelize) {
        AccessToken.init(sequelize,'accessToken');
        this.accessToken = AccessToken;
    }
}

module.exports = Data;