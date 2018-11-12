const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Category } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const categories = await Category.findAll();
  res.send(categories);
});

router.get(`/:id`, [auth, admin], async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).send('Category with submitted ID not found');
  }
  res.send(category);
});

router.post('/', [auth, admin], async (req, res) => {
  try {
    const category = await Category.create({ name: req.body.name });
    res.send(category);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).send('Category with submitted ID not found');
  }
  try {
    const updated_category = await category.update({ name: req.body.name });
    res.send(updated_category);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).send('Category with submitted ID not found');
  }
  await category.destroy();
  res.send(category);
});

module.exports = router;
