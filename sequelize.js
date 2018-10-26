const Sequelize = require('sequelize');
const UserModel = require('./models/user');
const UserQuizModel = require('./models/user_quiz');
const UserAnswerModel = require('./models/user_answer');
const QuizModel = require('./models/quiz');
const CategoryModel = require('./models/category');
const QuizQuestionModel = require('./models/quiz_question');
const QuestionModel = require('./models/question');

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: './db/database.sqlite'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  const User = UserModel(sequelize, Sequelize);
  const UserQuiz = UserQuizModel(sequelize, Sequelize);
  const UserAnswer = UserAnswerModel(sequelize, Sequelize);
  const Quiz = QuizModel(sequelize, Sequelize);
  const Category = CategoryModel(sequelize, Sequelize);
  const QuizQuestion = QuizQuestionModel(sequelize, Sequelize);
  const Question = QuestionModel(sequelize, Sequelize);

  // M - M
  User.belongsToMany(Quiz, {through: UserQuiz});
  Quiz.belongsToMany(User, {through: UserQuiz});
  // M - M
  UserQuiz.belongsToMany(Question, {through: UserAnswer});
  Question.belongsToMany(UserQuiz, {through: UserAnswer});
  // M - M
  Quiz.belongsToMany(Question, {through: QuizQuestion});
  Question.belongsToMany(Quiz, {through: QuizQuestion});
  // 1 - M
  Category.hasMany(Quiz);

  // force: true will drop the table if it already exists
  sequelize.sync({ force: true }).then(() => {
    console.log("Database and tables created");
  });

  module.exports = {
    User,
    UserQuiz,
    UserAnswer,
    Quiz,
    Category,
    QuizQuestion,
    Question
  };
