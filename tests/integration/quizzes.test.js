const { Quiz, Question, Category, User } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/quizzes', () => {
  afterEach(async () => {
    await Quiz.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Question.destroy({ where: {} });
  });

  describe('GET /', () => {
    let category, quizzes, token, user;

    const response = async (jwt) => {
      return await request
        .get('/api/quizzes')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      category = await Category.create({ name: 'School' });
      await Quiz.bulkCreate([
          {
            title: 'Solar System',
            description: 'Test your Solar System Knowledge',
            difficulty: 5,
            category_id: category.id
          },
          {
            title: 'Continents',
            description: 'Test your Geography Knowledge',
            difficulty: 10,
            category_id: category.id
          }
        ]);
      user = User.build({ admin: false });
      token = generateAuthToken(user);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all quizzes (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(e => e.title === 'Solar System')).toBeTruthy();
      expect(res.body.some(e => e.description === 'Test your Solar System Knowledge')).toBeTruthy();
      expect(res.body.some(e => e.difficulty === 5)).toBeTruthy();
      expect(res.body.some(e => e.title === 'Continents')).toBeTruthy();
      expect(res.body.some(e => e.description === 'Test your Geography Knowledge')).toBeTruthy();
      expect(res.body.some(e => e.difficulty === 10)).toBeTruthy();
      expect(res.body.some(e => e.category_id === category.id)).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let token, category, quiz_object, user;

    const response = async (object, jwt) => {
      return await request
        .post('/api/quizzes')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'School' });
      quiz_object = {
        title: 'Solar System',
        description: 'Test your Solar System Knowledge',
        difficulty: 5,
        category_id: category.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(quiz_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(quiz_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if quiz is invalid', async () => {
      quiz_object = { category_id: category.id };
      const res = await response(quiz_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid category ID', async () => {
      quiz_object.category_id = 'id';
      const res = await response(quiz_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if category ID valid but category ID not in DB', async () => {
      quiz_object.category_id = '10000';
      const res = await response(quiz_object, token);

      expect(res.status).toBe(400);
    });

    it('should save quiz if quiz is valid', async () => {
      const res = await response(quiz_object, token);
      const quiz = await Quiz.findOne({ where: { title: 'Solar System' }});

      expect(quiz).toHaveProperty('id');
      expect(quiz).toHaveProperty('title', 'Solar System');
      expect(quiz).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(quiz).toHaveProperty('difficulty', 5);
      expect(quiz).toHaveProperty('category_id', category.id);
    });

    it('should return quiz if quiz is valid', async () => {
      const res = await response(quiz_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'Solar System');
      expect(res.body).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(res.body).toHaveProperty('difficulty', 5);
      expect(res.body).toHaveProperty('category_id', category.id);
    });
  });

  describe('GET /ID', () => {
    let token, category_1, category_2, quiz, other_quiz, user;
    const response = async (id, jwt) => {
      return await request
        .get('/api/quizzes/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category_1 = await Category.create({ name: 'School' });
      category_2 = await Category.create({ name: 'Sports' });
      quiz = await Quiz.create({
        title: 'Solar System',
        description: 'Test your Solar System Knowledge',
        difficulty: 5,
        category_id: category_1.id
      });
      other_quiz = await Quiz.create({
        title: 'Basketball',
        description: 'Test your Basketball Knowledge',
        difficulty: 10,
        category_id: category_2.id
      });
      await Question.bulkCreate([
        { id: 1, quiz_id: quiz.id, question: 'What does the cow say?', answer: 'Moo!' },
        { id: 2, quiz_id: quiz.id, question: 'What does the cat say?', answer: 'Meow!' },
        { id: 3, quiz_id: other_quiz.id, question: "What is Harden's number?", answer: '13' }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(quiz.id, token);

      expect(res.status).toBe(401);
    });

    it('should only return questions if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(quiz.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', quiz.id);
      expect(res.body).toHaveProperty('title', 'Solar System');
      expect(res.body).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(res.body).toHaveProperty('difficulty', 5);
      expect(res.body).toHaveProperty('category_id', category_1.id);

      expect(res.body.questions.length).toBe(2);
      expect(res.body.questions.some(q => q.id === 1)).toBeTruthy();
      expect(res.body.questions.some(q => q.id === 2)).toBeTruthy();
      expect(res.body.questions.some(q => q.quiz_id === quiz.id)).toBeFalsy();
      expect(res.body.questions.some(q => q.question === 'What does the cow say?')).toBeTruthy();
      expect(res.body.questions.some(q => q.answer === 'Moo!')).toBeFalsy();
      expect(res.body.questions.some(q => q.question === 'What does the cat say?')).toBeTruthy();
      expect(res.body.questions.some(q => q.answer === 'Meow!')).toBeFalsy();
    });

    it('should return 404 if invalid quiz ID', async () => {
      quiz_id = 'id';
      const res = await response(quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if quiz ID valid but quiz ID not in DB', async () => {
      quiz_id = '10000';
      const res = await response(quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific quiz if valid quiz ID', async () => {
      const res = await response(quiz.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', quiz.id);
      expect(res.body).toHaveProperty('title', 'Solar System');
      expect(res.body).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(res.body).toHaveProperty('difficulty', 5);
      expect(res.body).toHaveProperty('category_id', category_1.id);

      expect(res.body.questions.length).toBe(2);
      expect(res.body.questions.some(q => q.quiz_id === quiz.id)).toBeTruthy();
      expect(res.body.questions.some(q => q.question === 'What does the cow say?')).toBeTruthy();
      expect(res.body.questions.some(q => q.answer === 'Moo!')).toBeTruthy();
      expect(res.body.questions.some(q => q.question === 'What does the cat say?')).toBeTruthy();
      expect(res.body.questions.some(q => q.answer === 'Meow!')).toBeTruthy();
    });
  });

  describe('PUT /ID', () => {
    let token, category, new_category, quiz, updated_quiz, user;

    const response = async (object, jwt, id) => {
      return await request
        .put('/api/quizzes/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'School' });
      new_category = await Category.create({ name: 'Business' });
      quiz = await Quiz.create({
        title: 'Solar System',
        description: 'Test your Solar System Knowledge',
        difficulty: 5,
        category_id: category.id
      });

      updated_quiz = {
        title: 'Top Companies',
        description: 'Test your Business Knowledge',
        difficulty: 7,
        category_id: new_category.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(updated_quiz, token, quiz.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(updated_quiz, token, quiz.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid quiz ID', async () => {
      const quiz_id = 'id';
      const res = await response(updated_quiz, token, quiz_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if quiz ID valid but quiz ID not in DB', async () => {
      const quiz_id = '10000';
      const res = await response(updated_quiz, token, quiz_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid category ID ', async () => {
      updated_quiz.category_id = 'id';
      const res = await response(updated_quiz, token, quiz.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if category ID valid but category ID not in DB', async () => {
      updated_quiz.category_id = '10000';
      const res = await response(updated_quiz, token, quiz.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if quiz is invalid', async () => {
      updated_quiz = { category_id: new_category.id };
      const res = await response(updated_quiz, token, quiz.id);
      expect(res.status).toBe(400);
    });

    it('should update quiz if input is valid', async () => {
      const res = await response(updated_quiz, token, quiz.id);
      const saved_quiz = await Quiz.findOne({ where: { title: 'Top Companies' } });

      expect(saved_quiz).toHaveProperty('id', quiz.id);
      expect(saved_quiz).toHaveProperty('title', 'Top Companies');
      expect(saved_quiz).toHaveProperty('description', 'Test your Business Knowledge');
      expect(saved_quiz).toHaveProperty('difficulty', 7);
      expect(saved_quiz).toHaveProperty('category_id', new_category.id);
    });

    it('should return updated quiz if it is valid', async () => {
      const res = await response(updated_quiz, token, quiz.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', quiz.id);
      expect(res.body).toHaveProperty('title', 'Top Companies');
      expect(res.body).toHaveProperty('description', 'Test your Business Knowledge');
      expect(res.body).toHaveProperty('difficulty', 7);
      expect(res.body).toHaveProperty('category_id', new_category.id);
    });
  });

  describe('DELETE /ID', () => {
    let token, category_1, category_2, quiz, user;
    const response = async (id, jwt) => {
      return await request
        .delete('/api/quizzes/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category_1 = await Category.create({ name: 'School' });
      category_2 = await Category.create({ name: 'Sports' });
      quiz = await Quiz.create({
        title: 'Solar System',
        description: 'Test your Solar System Knowledge',
        difficulty: 5,
        category_id: category_1.id
      });
      other_quiz = await Quiz.create({
        title: 'Basketball',
        description: 'Test your Basketball Knowledge',
        difficulty: 10,
        category_id: category_2.id
      });
      await Question.bulkCreate([
        { quiz_id: quiz.id, question: 'What does the cow say?', answer: 'Moo!' },
        { quiz_id: quiz.id, question: 'What does the cat say?', answer: 'Meow!' },
        { quiz_id: other_quiz.id, question: "What is Harden's number?", answer: '13' }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(quiz.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(quiz.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid quiz ID', async () => {
      const quiz_id = 'id';
      const res = await response(quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if quiz ID valid but quiz ID not in DB', async () => {
      const quiz_id = '10000';
      const res = await response(quiz_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete quiz and associated questions if input is valid', async () => {
      const res = await response(quiz.id, token);
      const returned_quiz = await Quiz.findOne({ where: { id: quiz.id } });
      const returned_questions = await Question.findAll({ where: { quiz_id: quiz.id } });

      expect(returned_quiz).toBeNull();
      expect(returned_questions).toEqual([]);
    });

    it('should return deleted quiz', async () => {
      const res = await response(quiz.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', quiz.id);
      expect(res.body).toHaveProperty('title', 'Solar System');
      expect(res.body).toHaveProperty('description', 'Test your Solar System Knowledge');
      expect(res.body).toHaveProperty('difficulty', 5);
      expect(res.body).toHaveProperty('category_id', category_1.id);
    });
  });
});
