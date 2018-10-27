// express default error handler
const winston = require('winston');

function errorHandler (err, req, res, next) {
  winston.error(err.message, err);
  res.status(500).send('Internal Server Error');
}
module.exports = errorHandler;
