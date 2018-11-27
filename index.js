const express = require('express');
const app = express();
const winston = require('winston');
const config = require('config');
require('express-async-errors'); // replaces try-catch blocks in route handlers
const helmet = require('helmet');
const compression = require('compression');

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

// ** Enable CORS: Start *******************************************************
const cors = require('cors');
app.use(cors());
// ** Enable CORS: End *********************************************************

// ** Express Routes: Start ****************************************************
const categories = require('./routes/categories');
const users = require('./routes/users');
const login = require('./routes/login');
const quizzes = require('./routes/quizzes');
const user_quizzes = require('./routes/user_quizzes');
const user_answers = require('./routes/user_answers');
const questions = require('./routes/questions');
const error = require('./middleware/error');

app.get('/', (req, res) => res.send('See README file for API use instructions'));
app.use(express.json());
app.use('/api/categories', categories);
app.use('/api/users', users);
app.use('/api/login', login);
app.use('/api/quizzes', quizzes);
  app.use('/api/quizzes', questions); // questions is nested
app.use('/api/user-quizzes', user_quizzes);
  app.use('/api/user-quizzes', user_answers); // user-answers is nested

app.use(error); // express default error handler
// ** Express Routes: End ******************************************************

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
