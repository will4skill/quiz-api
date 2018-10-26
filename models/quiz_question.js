module.exports = function(sequelize, DataTypes) {
  return sequelize.define('quiz_question', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    }
  }, {underscored: true});
};
