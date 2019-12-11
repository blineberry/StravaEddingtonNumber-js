const Sequelize = require('sequelize');

const Model = Sequelize.Model;

class AccessToken extends Model {
  static init(sequelize, modelName) {
    super.init({
      // attributes
      id: {
        type: Sequelize.INTEGER, 
        primaryKey: true,
        autoIncrement: true
      },
      athleteId: {
        type: Sequelize.INTEGER
      },
      scope: {
        type: Sequelize.BOOLEAN
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