const { User, UserQuiz, UserAnswer,
        Quiz, Category, Question } = require('../sequelize');

async function findCategory(req, res, next) {
  const category = await Category.findById(req.body.category_id);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }
  req.category = category;
  next();
}

async function findQuiz(req, res, next) {
  const quiz_id = req.params.quizId ? req.params.quizId : req.body.quiz_id;
  const quiz = await Quiz.findById(quiz_id, {
    include: {
      model: Question,
      where: { quiz_id: quiz_id },
      required: false
    }
  });
  if (!quiz) {
    return res.status(400).send('Invalid Quiz');
  }
  req.quiz = quiz;
  next();
}

async function findQuestion(req, res, next) {
  const question = await Question.findById(req.body.question_id);
  if (!question) {
    return res.status(400).send('Invalid Question');
  }
  req.question = question;
  next();
}

async function findUserQuiz(req, res, next) {
  const user_quiz = await UserQuiz.findById(req.params.userQuizId);
  if (!user_quiz) {
    return res.status(400).send('Invalid User Quiz');
  }
  req.user_quiz = user_quiz;
  next();
}

module.exports = {
  findCategory,
  findQuiz,
  findQuestion,
  findUserQuiz
};
