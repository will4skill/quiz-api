module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    password_digest: {
      type: DataTypes.STRING
    },
    admin: {
      type: DataTypes.BOOLEAN
    }
  }, {underscored: true});
};

## Entity Relationship Diagram
<p align="center">
  <img alt="Image of ERD" src="https://raw.github.com/jtimwill/quiz_api/master/images/quiz-api-erd.png" />
</p>
