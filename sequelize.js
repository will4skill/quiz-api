const config = require('config');
const db = config.get('db');

const Sequelize = require('sequelize');
const UserModel = require('./models/user');
const UserQuizModel = require('./models/user_quiz');
const UserAnswerModel = require('./models/user_answer');
const QuizModel = require('./models/quiz');
const CategoryModel = require('./models/category');
const QuestionModel = require('./models/question');

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: db
});

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

  const User = UserModel(sequelize, Sequelize);
  const UserQuiz = UserQuizModel(sequelize, Sequelize);
  const UserAnswer = UserAnswerModel(sequelize, Sequelize);
  const Quiz = QuizModel(sequelize, Sequelize);
  const Category = CategoryModel(sequelize, Sequelize);
  const Question = QuestionModel(sequelize, Sequelize);



  // M - M
  User.belongsToMany(Quiz, {through: UserQuiz}); // Problem: (user_id, quiz_id) UNIQUE
  Quiz.belongsToMany(User, {through: UserQuiz});

  // M - M (try to replace this with 2x m-m)
  UserQuiz.belongsToMany(Question, {through: UserAnswer});
  Question.belongsToMany(UserQuiz, {through: UserAnswer});

  // 1 - M
  Quiz.hasMany(Question, {onDelete: 'cascade'}); // Confirm cascade to UA on delete
  // 1 - M
  Category.hasMany(Quiz);
  // 1 - M
  UserQuiz.hasMany(UserAnswer);  // Confirm cascade to UA on delete

  // // force: true will drop the table if it already exists
  // sequelize.sync({ force: true }).then(() => {
  //   console.log("Database and tables created");
  //   // return User.create({
  //   //   name: 'Tim',
  //   //   email: 'test@email.com',
  //   //   password_digest: 'test',
  //   // });
  // });

  module.exports = {
    User,
    UserQuiz,
    UserAnswer,
    Quiz,
    Category,
    Question
  };
