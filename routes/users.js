const express = require('express');
const router = express.Router();
const { User } = require('../sequelize');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const generateAuthToken = require('../utilities/tokenUtility');

router.get('/', [auth, admin], async (req, res) => {
  const users = await User.findAll();
  res.send(users);
});

router.post('/', async (req, res) => {
  const password = req.body.password;
  const salt = await bcrypt.genSalt(10);
  const password_digest = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password_digest: password_digest
    });

    res
      .header('x-auth-token', generateAuthToken(user))
      .header('access-control-expose-headers', 'x-auth-token')
      .send(
        {
          id: user.id,
          name: req.body.name,
          email: req.body.email
        });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findOne({
    where: { id: req.user.id},
    attributes: { exclude: ['password_digest', 'created_at', 'updated_at'] }
  });
  res.send(user);
});

router.put('/me', auth, async (req, res) => {
  // To do:
  // 1. add ability to update password. Don't forget to update token if password is updated.
  // 2. add ability to update a single property

  try {
      const user = await User.findOne({
        where: { id: req.user.id},
        attributes: { exclude: ['password_digest', 'created_at', 'updated_at'] }
      });
      const updated_user = await user.update({
        name: req.body.name,
        email: req.body.email
      });
      res.send(updated_user);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id },
    attributes: { exclude: ['password_digest', 'created_at', 'updated_at'] }
  });
  if (!user) {
    res.status(404).send('User ID not found');
  } else {
    await user.destroy();
    res.send(user);
  }
});

module.exports = router;
