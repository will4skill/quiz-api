const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findQuestion, findUserQuiz } = require('../middleware/find');
const { UserAnswer, UserQuiz, Question } = require('../sequelize');
const prefix = '/:userQuizId/user-answers';

router.put(`${prefix}/:id`, [auth, admin, findQuestion, findUserQuiz], async (req, res) => {
  const user_answer = await UserAnswer.findOne({ where: { id: req.params.id } });
  if (!user_answer) {
    return res.status(404).send('User Answer with submitted ID not found');
  }

  try {
    const updated_user_answer = await user_answer.update({
      question_id: req.body.question_id,
      answer: req.body.answer,
      correct: req.body.correct
    });
    res.send(updated_user_answer);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete(`${prefix}/:id`, [auth, admin, findUserQuiz], async (req, res) => {
  const user_answer = await UserAnswer.findOne({ where: { id: req.params.id } });
  if (!user_answer) {
    return res.status(404).send('User Answer with submitted ID not found');
  }
  const deleted_user_answer = await user_answer.destroy();
  res.send(deleted_user_answer);
});

module.exports = router;
