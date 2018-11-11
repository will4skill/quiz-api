function getScore(req, res, next) {
  let answers = {};
  let count = 0;
  let correct = 0;

  req.quiz.questions.forEach((question) => {
    count++;
    answers[question.id] = question.answer;
  });

  req.body.user_answers.forEach((user_answer) => {
    if (user_answer.answer === answers[user_answer.question_id]) {
      user_answer.correct = true;
      correct++;
    } else {
      user_answer.correct = false;
    }
  });
  const score = correct/count;

  req.score = score;
  next();
}
module.exports = getScore;
