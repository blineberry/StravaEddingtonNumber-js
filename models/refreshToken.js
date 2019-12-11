const Sequelize = require('sequelize');

const Model = Sequelize.Model;

class RefreshToken extends Model {
  static init(sequelize, modelName) {
    super.init({
      // attributes
      athleteId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      scope: {
        type: Sequelize.STRING
      },
      code: {
          type: Sequelize.STRING
      }
    }, {
      sequelize,
      modelName: modelName
      // options
    })
  }
}


module.exports = RefreshToken;
