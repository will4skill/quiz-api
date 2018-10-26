module.exports = function(sequelize, DataTypes) {
  return sequelize.define('quiz', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    difficulty: {
      type: DataTypes.INTEGER
    }
  }, {underscored: true});
};
