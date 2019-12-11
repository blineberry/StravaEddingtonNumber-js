const Sequelize = require('sequelize');

const Model = Sequelize.Model;

class AccessToken extends Model {
  constructor(sequelize) {
    super();

    this.init({
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
      modelName: 'accessToken'
      // options
    });
  }
}

module.exports = AccessToken;