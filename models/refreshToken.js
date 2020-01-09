const Sequelize = require('sequelize');

const Model = Sequelize.Model;

class RefreshToken extends Model {
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
      }
    }, {
      sequelize,
      modelName: modelName
      // options
    })
  }
}


module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
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
    }
  }, {});
  RefreshToken.associate = function(models) {
    // associations can be defined here
  };
  return RefreshToken;
};
