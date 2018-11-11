const { UserQuiz, Quiz, User, UserAnswer, Question, Category } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/user-quizzes', () => {
  afterEach(async () => {
    await UserQuiz.destroy({ where: {} });
    await Quiz.destroy({ where: {} });
    await User.destroy({ where: {} });
    await UserAnswer.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Question.destroy({ where: {} });
  });

  describe('GET /', () => {
    let user, other_user, token, category, quiz_1, quiz_2,
    user_quiz_1, user_quiz_2, other_user_quiz, user_answers;

    const response = async (jwt) => {
      return await request
        .get('/api/user-quizzes')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "bob",
        email: "bob@example.com",
        password_digest: "123456"
      });
      token = generateAuthToken(user);
      other_user = await User.create({
        name: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });
      category = await Category.create({ name: 'School' });
      quiz_1 = await Quiz.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      quiz_2 = await Quiz.create({
        title: 'Continents',
        description: 'Test your Geography Knowledge',
        difficulty: 10,
        category_id: category.id
      });
      const question_1 = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      const question_2 = await Question.create({
        question: 'Which is the largest continent?',
        answer: 'Asia'
      });
      user_quiz_1 = await UserQuiz.create({
        score: 1.00,
        time: 20.00,
        quiz_id: quiz_1.id,
        user_id: user.id
      });
      user_quiz_2 = await UserQuiz.create({
        score: 0.00,
        time: 15.00,
        quiz_id: quiz_2.id,
        user_id: user.id
      });
      other_user_quiz = await UserQuiz.create({
        score: 1.00,
        time: 19.00,
        quiz_id: quiz_2.id,
        user_id: other_user.id
      });

      await UserAnswer.bulkCreate([
        {
          answer: 'Moo!',
          correct: true,
          user_quiz_id: user_quiz_1.id,
          question_id: question_1.id
        },
        {
          answer: 'America',
          correct: false,
          user_quiz_id: user_quiz_2.id,
          question_id: question_2.id
        },
        {
          answer: 'Asia',
          correct: true,
          user_quiz_id: other_user_quiz.id,
          question_id: question_2.id
        }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it(`should return all user quizzes and associated user_answers
        for current user only (stat code 200)`, async () => {
      const res = await response(token);

      expect(res.status).toBe(200);

      expect(res.body.some(uq => uq.id === user_quiz_1.id)).toBeTruthy();
      expect(res.body.some(uq => uq.id === user_quiz_2.id)).toBeTruthy();
      expect(res.body.some(uq => uq.id === other_user_quiz.id)).toBeFalsy();

      expect(res.body.some(uq => uq.score === user_quiz_1.score)).toBeTruthy();
      expect(res.body.some(uq => uq.score === user_quiz_2.score)).toBeTruthy();

      expect(res.body.some(uq => uq.time === user_quiz_1.time)).toBeTruthy();
      expect(res.body.some(uq => uq.time === user_quiz_2.time)).toBeTruthy();
      expect(res.body.some(uq => uq.time === other_user_quiz.time)).toBeFalsy();

      expect(res.body.some(uq => uq.quiz_id === user_quiz_1.quiz_id)).toBeTruthy();
      expect(res.body.some(uq => uq.quiz_id === user_quiz_2.quiz_id)).toBeTruthy();

      expect(res.body.some(uq => uq.user_id === user_quiz_1.user_id)).toBeTruthy();
      expect(res.body.some(uq => uq.user_id === user_quiz_2.user_id)).toBeTruthy();
      expect(res.body.some(uq => uq.user_id === other_user_quiz.user_id)).toBeFalsy();

      expect(res.body.some(uq => uq.user_answers.length === 1)).toBeTruthy();

      expect(res.body.length).toBe(2);
    });
  });

  describe('POST /', () => {
    let user, token, user_quiz_object, quiz, question_1, question_2;

    const response = async (object, jwt) => {
      return await request
        .post('/api/user-quizzes')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "bob",
        email: "bob@example.com",
        password_digest: "123456"
      });
      token = generateAuthToken(user);
      const category = await Category.create({ name: 'School' });
      quiz = await Quiz.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question_1 = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!',
        quiz_id: quiz.id
      });
      question_2 = await Question.create({
        question: 'What does the pig say?',
        answer: 'Oink!',
        quiz_id: quiz.id
      });
      user_quiz_object = {
        time: 12.34,
        quiz_id: quiz.id,
        user_id: user.id,
        user_answers: [
          { question_id: question_1.id, answer: "Moo!" },
          { question_id: question_2.id, answer: "Meow!" }
        ]
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_quiz_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid quiz ID', async () => {
      user_quiz_object.quiz_id = 'id';
      const res = await response(user_quiz_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if quiz ID valid but quiz ID not in DB', async () => {
      user_quiz_object.quiz_id = '10000';
      const res = await response(user_quiz_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user_quiz is invalid', async () => {
      user_quiz_object = {
        quiz_id: quiz.id,
        user_id: user.id,
        user_answers: []
      };
      const res = await response(user_quiz_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if any user_answer is invalid', async () => {
      user_quiz_object = {
        time: 12.34,
        quiz_id: quiz.id,
        user_id: user.id,
        user_answers: [
          { question_id: question_1.id, answer: "Moo!" },
          { }
        ]
      };
      const res = await response(user_quiz_object, token);

      expect(res.status).toBe(400);
    });

    it('should save user_quiz and user_answers if they are valid', async () => {
      const res = await response(user_quiz_object, token);
      const user_quiz = await UserQuiz.findOne({ where: { time: 12.34 } });
      const user_answer_1 = await UserAnswer.findOne({ where: { answer: "Moo!" } });
      const user_answer_2 = await UserAnswer.findOne({ where: { answer: "Meow!" } });

      expect(user_quiz).toHaveProperty('id');
      expect(user_quiz).toHaveProperty('score', 0.50);
      expect(user_quiz).toHaveProperty('time', 12.34);
      expect(user_quiz).toHaveProperty('quiz_id', quiz.id);
      expect(user_quiz).toHaveProperty('user_id', user.id);

      expect(user_answer_1).toHaveProperty('answer', 'Moo!');
      expect(user_answer_1).toHaveProperty('correct', true);
      expect(user_answer_1).toHaveProperty('question_id', question_1.id);

      expect(user_answer_2).toHaveProperty('answer', 'Meow!');
      expect(user_answer_2).toHaveProperty('correct', false);
      expect(user_answer_2).toHaveProperty('question_id', question_2.id);
    });

    it('should return user_quiz if user_quiz is valid', async () => {
      const res = await response(user_quiz_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('score', 0.50);
      expect(res.body).toHaveProperty('time', 12.34);
      expect(res.body).toHaveProperty('quiz_id', quiz.id);
      expect(res.body).toHaveProperty('user_id', user.id);
    });
  });

  describe('GET /ID', () => {
    let user, other_user, token, category, quiz,
    user_quiz, other_user_quiz, user_answers,
    question_1, question_2;

    const response = async (uq_id, jwt) => {
      return await request
        .get('/api/user-quizzes/' + uq_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "bob",
        email: "bob@example.com",
        password_digest: "123456"
      });
      token = generateAuthToken(user);
      other_user = await User.create({
        name: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });
      category = await Category.create({ name: 'School' });
      quiz = await Quiz.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question_1 = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      question_2 = await Question.create({
        question: 'What does the pig say?',
        answer: 'Oink!'
      });
      user_quiz = await UserQuiz.create({
        score: 0.50,
        time: 20.00,
        quiz_id: quiz.id,
        user_id: user.id
      });
      other_user_quiz = await UserQuiz.create({
        score: 1.00,
        time: 19.00,
        quiz_id: quiz.id,
        user_id: other_user.id
      });
      user_answers = [
        {
          user_quiz_id: user_quiz.id,
          answer: "Moo!",
          correct: true,
          question_id: question_1.id
        },
        {
          user_quiz_id: user_quiz.id,
          answer: "Meow!",
          correct: false,
          question_id: question_2.id
        },
        {
          user_quiz_id: other_user_quiz.id,
          answer: "Oink!",
          correct: true,
          question_id: question_2.id
        }
      ];
      await UserAnswer.bulkCreate(user_answers);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_quiz.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
      const res = await response(other_user_quiz.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid user_quiz ID', async () => {
      const user_quiz_id = 'id';
      const res = await response(user_quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user_quiz ID valid but user_quiz ID not in DB', async () => {
      const user_quiz_id = '10000';
      const res = await response(user_quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should return user_quiz and all associated user_answers (stat code 200)', async () => {
      const res = await response(user_quiz.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_quiz.id);
      expect(res.body).toHaveProperty('score', 0.50);
      expect(res.body).toHaveProperty('time', 20.00);
      expect(res.body).toHaveProperty('quiz_id', quiz.id);
      expect(res.body).toHaveProperty('user_id', user.id);

      expect(res.body.user_answers.length).toBe(2);
      expect(res.body.user_answers.some(ua => ua.user_quiz_id === user_quiz.id)).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.answer === 'Moo!')).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.correct === true)).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.question_id === question_1.id)).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.answer === 'Meow!')).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.correct === false)).toBeTruthy();
      expect(res.body.user_answers.some(ua => ua.question_id === question_2.id)).toBeTruthy();
    });
  });

  describe('PUT /ID', () => {
    let user, other_user, token, quiz, user_quiz_object,
    user_quiz, other_user_quiz;

    const response = async (object, uq_id, jwt) => {
      return await request
        .put('/api/user-quizzes/' + uq_id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "bob",
        email: "bob@example.com",
        password_digest: "123456",
        admin: true
      });
      token = generateAuthToken(user);
      other_user = await User.create({
        name: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });
      const category = await Category.create({ name: 'School' });
      quiz = await Quiz.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      user_quiz = await UserQuiz.create({
        score: 0.50,
        time: 20.00,
        quiz_id: quiz.id,
        user_id: user.id
      });
      other_user_quiz = await UserQuiz.create({
        score: 1.00,
        time: 19.00,
        quiz_id: quiz.id,
        user_id: other_user.id
      });
      user_quiz_object = {
        score: 1.00,
        time: 35.00,
        quiz_id: quiz.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_quiz_object, user_quiz.id, token);

      expect(res.status).toBe(401);
    });

     it('should return 403 if user is not current user', async () => {
      const res = await response(user_quiz_object, other_user_quiz.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(user_quiz_object, user_quiz.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid quiz ID', async () => {
      user_quiz_object.quiz_id = 'id';
      const res = await response(user_quiz_object, user_quiz.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if quiz ID valid but quiz ID not in DB', async () => {
      user_quiz_object.quiz_id = '10000';
      const res = await response(user_quiz_object, user_quiz.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid user_quiz ID', async () => {
      const user_quiz_id = 'id';
      const res = await response(user_quiz_object, user_quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user_quiz ID valid but user_quiz ID not in DB', async () => {
      const user_quiz_id = '10000';
      const res = await response(user_quiz_object, user_quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 400 if user_quiz is invalid', async () => {
      user_quiz_object = { quiz_id: quiz.id };
      const res = await response(user_quiz_object, user_quiz.id, token);

      expect(res.status).toBe(400);
    });

    it('should update user_quiz if input is valid', async () => {
      const res = await response(user_quiz_object, user_quiz.id, token);
      const result = await UserQuiz.findOne({ where: user_quiz_object });

      expect(result).toHaveProperty('id', user_quiz.id);
      expect(result).toHaveProperty('score', 1.00);
      expect(result).toHaveProperty('time', 35.00);
      expect(result).toHaveProperty('quiz_id', quiz.id);
      expect(result).toHaveProperty('user_id', user.id);
    });

    it('should return updated user_quiz if it is valid', async () => {
      const res = await response(user_quiz_object, user_quiz.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_quiz.id);
      expect(res.body).toHaveProperty('score', 1.00);
      expect(res.body).toHaveProperty('time', 35.00);
      expect(res.body).toHaveProperty('quiz_id', quiz.id);
      expect(res.body).toHaveProperty('user_id', user.id);
    });
  });

  describe('DELETE /ID', () => {
    let user, other_user, token, category, quiz,
    user_quiz, other_user_quiz, user_answers,
    question_1, question_2;

    const response = async (uq_id, jwt) => {
      return await request
        .delete('/api/user-quizzes/' + uq_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        name: "bob",
        email: "bob@example.com",
        password_digest: "123456",
        admin: true
      });
      token = generateAuthToken(user);
      other_user = await User.create({
        name: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });
      category = await Category.create({ name: 'School' });
      quiz = await Quiz.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question_1 = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      question_2 = await Question.create({
        question: 'What does the pig say?',
        answer: 'Oink!'
      });
      user_quiz = await UserQuiz.create({
        score: 0.50,
        time: 20.00,
        quiz_id: quiz.id,
        user_id: user.id
      });
      other_user_quiz = await UserQuiz.create({
        score: 1.00,
        time: 19.00,
        quiz_id: quiz.id,
        user_id: other_user.id
      });
      user_answers = [
        {
          user_quiz_id: user_quiz.id,
          answer: "Moo!",
          correct: true,
          question_id: question_1.id
        },
        { user_quiz_id: user_quiz.id,
          answer: "Meow!",
          correct: false,
          question_id: question_2.id
        },
        {
          user_quiz_id: other_user_quiz.id,
          answer: "Oink!",
          correct: true,
          question_id: question_2.id
        }
      ];
      await UserAnswer.bulkCreate(user_answers);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_quiz.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(user_quiz.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid user_quiz ID', async () => {
      const user_quiz_id = 'id';
      const res = await response(user_quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user_quiz ID valid but user_quiz ID not in DB', async () => {
      const user_quiz_id = '10000';
      const res = await response(user_quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete user_quiz and associated user_answers if input is valid', async () => {
      const res = await response(user_quiz.id, token);
      const returned_user_quiz = await UserQuiz.findById(user_quiz.id);
      const returned_user_answers = await UserAnswer.findAll({
        where: { user_quiz_id: user_quiz.id }
      });

      expect(returned_user_quiz).toBeNull();
      expect(returned_user_answers).toEqual([]);
    });

    it('should return deleted user_quiz', async () => {
      const res = await response(user_quiz.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_quiz.id);
      expect(res.body).toHaveProperty('score', 0.50);
      expect(res.body).toHaveProperty('time', 20.00);
      expect(res.body).toHaveProperty('quiz_id', quiz.id);
      expect(res.body).toHaveProperty('user_id', user.id);
    });
  });
});
