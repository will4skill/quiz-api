module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_quiz', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    time: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {underscored: true});
};
