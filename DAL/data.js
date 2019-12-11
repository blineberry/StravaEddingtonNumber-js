var AccessToken = require('../models/accessToken');

module.exports = {
    init: (sequelize) => {
        this.accessToken = new AccessToken(sequelize);
    }
};