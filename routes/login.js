const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../sequelize');
const generateAuthToken = require('../utilities/tokenUtility');

router.post('/', async (req, res) => {
  let user = await User.findOne({ where: { email: req.body.email } });
  if (!user) return res.status(400).send('Invalid email or password.');

  const found_password = await bcrypt.compare(req.body.password, user.password_digest);
  if (!found_password) return res.status(400).send('Invalid email or password.');

  const jwt = generateAuthToken(user);
  res.send({ jwt });
});

module.exports = router;
