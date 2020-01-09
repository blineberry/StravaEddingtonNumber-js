const Sequelize = require('sequelize');

const Model = Sequelize.Model;

class Activity extends Model {
  static init(sequelize, modelName) {
    super.init({
      // attributes
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
      },
      athleteId: {
        type: Sequelize.BIGINT
      },
      startDate: {
          type: Sequelize.DATE
      },
      distance: {
          type: Sequelize.INTEGER
      },
      type: {
          type: Sequelize.STRING
      },
    }, {  
      sequelize,
      modelName: modelName
      // options
    });
  }
}

module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    athleteId: {
      type: DataTypes.BIGINT
    },
    startDate: {
        type: DataTypes.DATE
    },
    distance: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.STRING
    }
  }, {});
  Activity.associate = function(models) {
    // associations can be defined here
  };
  return Activity;
};
