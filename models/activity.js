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

module.exports = Activity;
