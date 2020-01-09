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

module.exports = (sequelize, DataTypes) => {
  const AccessToken = sequelize.define('AccessToken', {
    // attributes
    athleteId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    scope: {
      type: DataTypes.STRING
    },
    code: {
        type: DataTypes.STRING
    },
    expiresAt: {
        type: DataTypes.DATE
    }
  }, {});
  AccessToken.associate = function(models) {
    // associations can be defined here
  };
  return AccessToken;
};
