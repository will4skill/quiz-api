const express = require('express');
const app = express();
const winston = require('winston');
const config = require('config');
require('express-async-errors'); // replaces try-catch blocks in route handlers

// const helmet = require('helmet');
// const compression = require('compression');

// ** Node Error Logging: Start ************************************************
const logger = winston.createLogger({
  transports: [ new winston.transports.File({ filename: 'logfile.log' }) ],
  exceptionHandlers: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'exceptions.log' })
  ]
});
process.on('unhandledRejection', (exception) => { throw exception });
// ** Node Error Logging: End **************************************************

// ** Express Routes: Start ****************************************************
const users = require('./routes/users');
const error = require('./middleware/error');

app.use(express.json());
app.use('/api/users', users);
app.use(error); // express default error handler
// ** Express Routes: End ******************************************************

// ** Database Setup: Start ****************************************************
// const db = config.get('db');
// mongoose.connect(db, { useNewUrlParser: true })
//   .then(() => logger.info(`Connected to ${db}...`));
// ** Database Setup: End ******************************************************

// ** Private Key Setup: Start *************************************************
if (!config.get('jwt_private_key')) {
  throw new Error('FATAL ERROR: jwt_private_key is not defined.');
}
// ** Private Key Setup: End ***************************************************

// ** Server Setup: Start ******************************************************
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || config.get('port');
  const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));
}
module.exports = app; // Export for use in tests
// ** Server Setup: End ********************************************************
