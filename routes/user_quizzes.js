const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { sequelize, UserQuiz, UserAnswer, Quiz } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const user_quizzes = await UserQuiz.findAll({ where: { user_id: req.user.id } });
  res.send(user_quizzes);
});

router.post('/', auth, async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.body.quiz_id } });
  if (!quiz) return res.status(400).send('Invalid Quiz');

  let user_quiz = UserQuiz.build({
    score: req.body.score,
    time: req.body.time,
    user_id: req.user.id,
    quiz_id: req.body.quiz_id
  });

  return sequelize.transaction( t => {
    return user_quiz.save({ transaction: t }).then( uq => {
        if (req.body.user_answers.length) {
          // * Possible problem: question_id pointed to wrong question by client *
          req.body.user_answers.forEach( a => { a.user_quiz_id = uq.id });
          return UserAnswer.bulkCreate(req.body.user_answers, { transaction: t });
        }
        return user_quiz;
      });
    }).then( result => {
      res.send(user_quiz);
    }).catch( err =>  {
      res.status(400).send(err);
    });
});

router.get('/:id', auth, async (req, res) => {
  const user_quiz = await UserQuiz.findOne({
    where: { id: req.params.id },
    include: [{ model: UserAnswer, where: { user_quiz_id: sequelize.col('user_quiz.id')} }]
  });
  if (!user_quiz) {
    res.status(404).send('UserQuiz with submitted ID not found');
  } else {// Check for current user
    if (req.user.id !== user_quiz.user_id) {
      res.status(403).send('Forbidden');
    } else {
      res.send(user_quiz);
    }
  }
});

router.put('/:id', [auth, admin], async (req, res) => {

  let user_quiz = await UserQuiz.findOne({ where: { id: req.params.id } });
  if (!user_quiz) {
    return res.status(404).send('UserQuiz with submitted ID not found');
  } else if (req.user.id !== user_quiz.user_id) {
    return res.status(403).send('Forbidden');
  }

  const quiz = await Quiz.findOne({ where: { id: req.body.quiz_id } });
  if (!quiz) return res.status(400).send('Invalid Quiz');

  try {
    const updated_user_quiz = await user_quiz.update({
      score: req.body.score,
      time: req.body.time,
      user_id: req.user.id,
      quiz_id: req.body.quiz_id
    });
    res.send(updated_user_quiz);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const user_quiz = await UserQuiz.findOne({ where: { id: req.params.id } });
  if (!user_quiz) {
    res.status(404).send('UserQuiz ID not found');
  } else {// Check for current user
    if (req.user.id !== user_quiz.user_id) {
      res.status(403).send('Forbidden');
    } else {
      const deleted_user_quiz = await user_quiz.destroy(); // Auto-deletes user-answers
      res.send(deleted_user_quiz);
    }
  }
});

module.exports = router;
