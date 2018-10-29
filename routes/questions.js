const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Question } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const questions = await Question.findAll();
  res.send(questions);
});

router.post('/', [auth, admin], async (req, res) => {
  try {
    const question = await Question.create({
      question: req.body.question,
      answer: req.body.answer
    });
    res.send(question);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:id', [auth, admin], async (req, res) => {
  const question = await Question.findOne({ where: { id: req.params.id } });
  if (!question) {
    res.status(404).send('Question with submitted ID not found');
  } else {
    res.send(question);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
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

router.delete('/:id', [auth, admin], async (req, res) => {
  const question = await Question.findOne({ where: { id: req.params.id } });
  if (!question) {
    res.status(404).send('Question ID not found');
  } else {
    const deleted_question = await question.destroy();
    res.send(deleted_question);
  }
});

module.exports = router;
