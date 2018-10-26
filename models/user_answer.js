module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_answer', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    answer: {
      type: DataTypes.TEXT
    },
    correct: {
      type: DataTypes.BOOLEAN
    }
  }, {underscored: true});
};
