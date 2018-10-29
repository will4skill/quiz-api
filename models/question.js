module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    question: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {underscored: true});
};
