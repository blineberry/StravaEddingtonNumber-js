const Sequelize = require('sequelize');

const Model = Sequelize.Model;

class AccessToken extends Model {
  static init(sequelize, modelName) {
    super.init({
      // attributes
      athleteId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
      },
      scope: {
        type: Sequelize.STRING
      },
      code: {
          type: Sequelize.STRING
      },
      expiresAt: {
          type: Sequelize.DATE
      }
    }, {  
      sequelize,
      modelName: modelName
      // options
    });
  }
}

module.exports = AccessToken;