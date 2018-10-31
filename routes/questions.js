const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Question, Quiz } = require('../sequelize');

router.get('/:quizId/questions', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.quizId } });
  if (!quiz) return res.status(400).send('Invalid Quiz');

  const questions = await Question.findAll({
    where: { quiz_id: req.params.quizId }
  });
  res.send(questions);
});

router.post('/:quizId/questions', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.quizId } });
  if (!quiz) return res.status(400).send('Invalid Quiz');

  try {
    const question = await Question.create({
      quiz_id: req.params.quizId,
      question: req.body.question,
      answer: req.body.answer
    });
    res.send(question);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:quizId/questions/:id', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.quizId } });
  if (!quiz) return res.status(400).send('Invalid Quiz');

  const question = await Question.findOne({ where: { id: req.params.id } });
  if (!question) {
    res.status(404).send('Question with submitted ID not found');
  } else {
    res.send(question);
  }
});

router.put('/:quizId/questions/:id', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.quizId } });
  if (!quiz) return res.status(400).send('Invalid Quiz');

  const question = await Question.findOne({ where: { id: req.params.id } });
  if (!question) return res.status(404).send('Question with submitted ID not found');

  try {
    const updated_question = await question.update({
      question: req.body.question,
      answer: req.body.answer
    });
    res.send(updated_question);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:quizId/questions/:id', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.quizId } });
  if (!quiz) return res.status(400).send('Invalid Quiz');

  const question = await Question.findOne({ where: { id: req.params.id } });
  if (!question) {
    res.status(404).send('Question ID not found');
  } else {
    const deleted_question = await question.destroy();
    res.send(deleted_question);
  }
});

module.exports = router;
