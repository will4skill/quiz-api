const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findCategory } = require('../middleware/find');
const { Quiz, Question, Category } = require('../sequelize');
const Sequelize = require('sequelize');

router.get('/', auth, async (req, res) => {
  const quizzes = await Quiz.findAll();
  res.send(quizzes);
});

router.post('/', [auth, admin, findCategory], async (req, res) => {
  try {
    const quiz = await Quiz.create({
      title: req.body.title,
      description: req.body.description,
      difficulty: req.body.difficulty,
      category_id: req.category.id
    });
    res.send(quiz);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:id', auth, async (req, res) => {
  let quiz;
  if (req.user.admin === false) {
    quiz = await Quiz.findOne({
      where: { id: req.params.id },
      include: [{
        model: Question,
        where: { quiz_id: Sequelize.col('quiz.id')},
        attributes: ['question'],
        required: false
      }]
    });
  } else {
    quiz = await Quiz.findOne({
      where: { id: req.params.id },
      include: [{
        model: Question,
        where: { quiz_id: Sequelize.col('quiz.id')},
        required: false
      }]
    });
  }

  if (!quiz) {
    res.status(404).send('Quiz with submitted ID not found');
  } else {
    res.send(quiz);
  }
});

router.put('/:id', [auth, admin, findCategory], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.id } });
  if (!quiz) return res.status(404).send('Quiz with submitted ID not found');

  try {
    const updated_quiz = await quiz.update({
      title: req.body.title,
      description: req.body.description,
      difficulty: req.body.difficulty,
      category_id: req.category.id
    });
    res.send(updated_quiz);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const quiz = await Quiz.findOne({ where: { id: req.params.id } });
  if (!quiz) return res.status(404).send('Quiz ID not found');

  const deleted_quiz = await quiz.destroy(); // Auto-deletes questions
  res.send(deleted_quiz);
});

module.exports = router;
