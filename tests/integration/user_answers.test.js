const { UserAnswer, User, UserQuiz, Question, Category, Quiz, sequelize } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/:userQuizId/user-answers/', () => {
  afterEach(async () => {
    await UserAnswer.destroy({ where: {} });
    await User.destroy({ where: {} });
    await UserQuiz.destroy({ where: {} });
    await Quiz.destroy({ where: {} });
    await Question.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  afterAll(() => {
    sequelize.close();
  });

  describe('PUT /ID', () => {
    let user, token, category, quiz, question,
    user_quiz, user_answer, updated_user_answer;

    const response = async (object, jwt, userQuizId, id) => {
      return await request
        .put(`/api/user-quizzes/${userQuizId}/user-answers/${id}`)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'School' });
      quiz = await Quiz.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      user_quiz = await UserQuiz.create({
        score: 1.00,
        time: 20.00,
        quiz_id: quiz.id,
        user_id: user.id
      });
      user_answer = await UserAnswer.create({
        answer: 'Oink!',
        correct: false,
        user_quiz_id: user_quiz.id,
        question_id: question.id
      });
      updated_user_answer = {
        answer: 'Moo!',
        correct: true,
        question_id: question.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid user_answer ID', async () => {
      const user_answer_id = 'id';
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user_answer ID valid but user_answer ID not in DB', async () => {
      const user_answer_id = '10000';
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid user_quiz ID ', async () => {
      const user_quiz_id = 'id';
      const res = await response(updated_user_answer, token, user_quiz_id, user_answer.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user_quiz ID valid but user_quiz ID not in DB', async () => {
      const user_quiz_id = '10000';
      const res = await response(updated_user_answer, token, user_quiz_id, user_answer.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid question ID ', async () => {
      updated_user_answer.question_id = 'id';
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if question ID valid but question ID not in DB', async () => {
      updated_user_answer.question_id = '10000';
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user_answer is invalid', async () => {
      updated_user_answer = { question_id: question.id };
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer.id);

      expect(res.status).toBe(400);
    });

    it('should update user_answer if input is valid', async () => {
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer.id);
      const result = await UserAnswer.findById(user_answer.id);

      expect(result).toHaveProperty('id', user_answer.id);
      expect(result).toHaveProperty('answer', 'Moo!');
      expect(result).toHaveProperty('correct', true);
      expect(result).toHaveProperty('user_quiz_id', user_quiz.id);
      expect(result).toHaveProperty('question_id', question.id);
    });

    it('should return updated user_answer if it is valid', async () => {
      const res = await response(updated_user_answer, token, user_quiz.id, user_answer.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_answer.id);
      expect(res.body).toHaveProperty('answer', 'Moo!');
      expect(res.body).toHaveProperty('correct', true);
      expect(res.body).toHaveProperty('user_quiz_id', user_quiz.id);
      expect(res.body).toHaveProperty('question_id', question.id);
    });
  });

  describe('DELETE /ID', () => {
    let token, category, quiz, question, user, user_quiz, user_answer;

    const response = async (userQuizId, id, jwt) => {
      return await request
        .delete(`/api/user-quizzes/${userQuizId}/user-answers/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'School' });
      quiz = await Quiz.create({
        title: 'Farm Animals',
        description: 'Test your Farm Animal Knowledge',
        difficulty: 5,
        category_id: category.id
      });
      question = await Question.create({
        question: 'What does the cow say?',
        answer: 'Moo!'
      });
      user_quiz = await UserQuiz.create({
        score: 0.00,
        time: 20.00,
        quiz_id: quiz.id,
        user_id: user.id
      });
      user_answer = await UserAnswer.create({
        answer: 'Oink!',
        correct: false,
        user_quiz_id: user_quiz.id,
        question_id: question.id
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_quiz.id, user_answer.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(user_quiz.id, user_answer.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid user_quiz ID ', async () => {
      const user_quiz_id = 'id';
      const res = await response(user_quiz_id, user_answer.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user_quiz ID valid but user_quiz ID not in DB', async () => {
      const user_quiz_id = '10000';
      const res = await response(user_quiz_id, user_answer.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid user_answer ID', async () => {
      const user_answer_id = 'id';
      const res = await response(user_quiz.id, user_answer_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user_answer ID valid but user_answer ID not in DB', async () => {
      const user_answer_id = '10000';
      const res = await response(user_quiz.id, user_answer_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete user_answer if input is valid', async () => {
      const res = await response(user_quiz.id, user_answer.id, token);
      const result = await UserAnswer.findOne({ where: { id: user_answer.id } });

      expect(result).toBeNull();
    });

    it('should return deleted user_answer', async () => {
      const res = await response(user_quiz.id, user_answer.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_answer.id);
      expect(res.body).toHaveProperty('answer', 'Oink!');
      expect(res.body).toHaveProperty('correct', false);
      expect(res.body).toHaveProperty('user_quiz_id', user_quiz.id);
      expect(res.body).toHaveProperty('question_id', question.id);
    });
  });
});
