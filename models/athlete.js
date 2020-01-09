const Sequelize = require('sequelize');

const Model = Sequelize.Model;

class Athlete extends Model {
  static init(sequelize, modelName) {
    super.init({
      // attributes
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
          type: Sequelize.STRING
      },
      activityFetchTime: {
          type: Sequelize.INTEGER,
          defaultValue: 0
      },
      isFetching: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
      },
      isFetchTimeTooLong: {
          type: Sequelize.VIRTUAL,
          get() {
              return ((Date.now() / 1000) - this.getDataValue('activityFetchTime')) > 2592000;
          },
      },
      stravaUrl: {
        type: Sequelize.VIRTUAL,
        get() {
          return `https://www.strava.com/athletes/${ this.getDataValue('id') }`;
        }
      },
      profileImageUrl: {
          type: Sequelize.STRING,
      },
    }, {  
      sequelize,
      modelName: modelName
      // options
    });
  }
}

module.exports = (sequelize, DataTypes) => {
  const Athlete = sequelize.define('Athlete', {
    // attributes
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    firstname: {
      type: DataTypes.STRING
    },
    lastname: {
        type: DataTypes.STRING
    },
    activityFetchTime: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isFetching: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isFetchTimeTooLong: {
        type: DataTypes.VIRTUAL,
        get() {
            return ((Date.now() / 1000) - this.getDataValue('activityFetchTime')) > 2592000;
        },
    },
    stravaUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return `https://www.strava.com/athletes/${ this.getDataValue('id') }`;
      }
    },
    profileImageUrl: {
        type: DataTypes.STRING,
    },
  }, {});
  Athlete.associate = function(models) {
    // associations can be defined here
  };
  return Athlete;
};
