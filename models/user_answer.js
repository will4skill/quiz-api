module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_answer', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {underscored: true});
};
