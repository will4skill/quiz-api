const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = function generateAuthToken(user){
  const secret = config.get('jwt_private_key');
  return jwt.sign({ id: user.id, admin: user.admin }, secret);
}
