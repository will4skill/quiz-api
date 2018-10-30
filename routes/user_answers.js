const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { UserAnswer, UserQuiz, Question } = require('../sequelize');

router.put('/:id', [auth, admin], async (req, res) => {
  const user_answer = await UserAnswer.findOne({ where: { id: req.params.id } });
  if (!user_answer) return res.status(404).send('User Answer with submitted ID not found');

  const user_quiz = await UserQuiz.findOne({ where: { id: req.body.user_quiz_id } });
  if (!user_quiz) return res.status(400).send('Invalid User Quiz');

  const question = await Question.findOne({ where: { id: req.body.question_id } });
  if (!question) return res.status(400).send('Invalid Question');

  try {
    const updated_user_answer = await user_answer.update({
      user_quiz_id: req.body.user_quiz_id,
      question_id: req.body.question_id,
      answer: req.body.answer,
      correct: req.body.correct
    });
    res.send(updated_user_answer);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const user_answer = await UserAnswer.findOne({ where: { id: req.params.id } });
  if (!user_answer) {
    res.status(404).send('User Answer ID not found');
  } else {
    const deleted_user_answer = await user_answer.destroy();
    res.send(deleted_user_answer);
  }
});

module.exports = router;
