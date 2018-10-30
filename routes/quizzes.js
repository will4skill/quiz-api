const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Quiz, Question, Category } = require('../sequelize');
const Sequelize = require('sequelize');

router.get('/', auth, async (req, res) => {
  const quizzes = await Quiz.findAll();
  res.send(quizzes);
});

router.post('/', [auth, admin], async (req, res) => {
  const category = await Category.findOne({ where: { id: req.body.category_id } });
  if (!category) return res.status(400).send('Invalid Category');

  try {
    const quiz = await Quiz.create({
      title: req.body.title,
      description: req.body.description,
      difficulty: req.body.difficulty,
      category_id: req.body.category_id
    });
    res.send(quiz);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:id', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({
    where: { id: req.params.id },
    include: [{ model: Question, where: { quiz_id: Sequelize.col('quiz.id')} }]
  });
  if (!quiz) {
    res.status(404).send('Quiz with submitted ID not found');
  } else {
    res.send(quiz);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.id } });
  if (!quiz) return res.status(404).send('Quiz with submitted ID not found');

  const category = await Category.findOne({ where: { id: req.body.category_id } });
  if (!category) return res.status(400).send('Invalid Category');

  try {
    const updated_quiz = await quiz.update({
      title: req.body.title,
      description: req.body.description,
      difficulty: req.body.difficulty,
      category_id: req.body.category_id
    });
    res.send(updated_quiz);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.id } });
  if (!quiz) {
    res.status(404).send('Quiz ID not found');
  } else {
    const deleted_quiz = await quiz.destroy();
    res.send(deleted_quiz);
  }
});

module.exports = router;
