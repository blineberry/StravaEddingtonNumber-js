const Sequelize = require('sequelize');

const Model = Sequelize.Model;
class AccessToken extends Model {}
AccessToken.init({
  // attributes
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