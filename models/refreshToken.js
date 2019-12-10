const Sequelize = require('sequelize');

const Model = Sequelize.Model;
class RefreshToken extends Model {}
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
  }
}, {
  sequelize,
  modelName: 'refreshToken'
  // options
});