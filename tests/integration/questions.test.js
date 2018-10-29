const { Question, User } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/questions', () => {
  afterEach(async () => {
    await Question.destroy({ where: {} });
    // await server.close();
  });

  describe('GET /', () => {
    const response = async (jwt) => {
      return await request
        .get('/api/questions')
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all questions (stat code 200)', async () => {
      await Question.bulkCreate([
        { question: 'What does the cow say?', answer: 'Moo!' },
        { question: 'What does the cat say?', answer: 'Meow!' }
      ]);
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);

      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.question === 'What does the cow say?')).toBeTruthy();
      expect(res.body.some(m => m.answer === 'Moo!')).toBeTruthy();
      expect(res.body.some(m => m.question === 'What does the cat say?')).toBeTruthy();
      expect(res.body.some(m => m.answer === 'Meow!')).toBeTruthy();
    });
  });

  describe('POST /', () => {
    const response = async (object, jwt) => {
      return await request
        .post('/api/questions')
        .send(object)
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const question_object = { question: 'What does the cow say?', answer: 'Moo!' };
      const res = await response(question_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const question_object = { question: 'What does the cow say?', answer: 'Moo!' };
      const res = await response(question_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if question is invalid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_object = {};
      const res = await response(question_object, token);

      expect(res.status).toBe(400);
    });

    it('should save question if question is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_object = { question: 'What does the cow say?', answer: 'Moo!' };
      const res = await response(question_object, token);
      const question = await Question.findOne({ where: { question: 'What does the cow say?', answer: 'Moo!' } });

      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('question', 'What does the cow say?');
      expect(question).toHaveProperty('answer', 'Moo!');
    });

    it('should return question if question is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_object = { question: 'What does the cow say?', answer: 'Moo!' };
      const res = await response(question_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('question', 'What does the cow say?');
      expect(res.body).toHaveProperty('answer', 'Moo!');
    });
  });

  describe('GET /ID', () => {
    const response = async (id, jwt) => {
      return await request
        .get('/api/questions/' + id)
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const question_id = '1';
      const res = await response(question_id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const question_id = '1';
      const res = await response(question_id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid question ID', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_id = 'id';
      const res = await response(question_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if question ID valid but question ID not in DB', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_id = '10000';
      const res = await response(question_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific question if valid question ID', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question = await Question.create({ question: 'What does the cow say?', answer: 'Moo!' });
      const res = await response(question.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', question.id);
      expect(res.body).toHaveProperty('question', question.question);
      expect(res.body).toHaveProperty('answer', question.answer);
    });
  });

  describe('PUT /ID', () => {
    const response = async (object, jwt, id) => {
      return await request
        .put('/api/questions/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const question_id = '1';
      const question_object = { question: 'What does the cow say?', answer: 'Moo!' };
      const res = await response(question_object, token, question_id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const question_id = '1';
      const question_object = { question: 'What does the cow say?', answer: 'Moo!' };
      const res = await response(question_object, token, question_id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid question ID ', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_id = 'id';
      const question_object = { question: 'What does the cow say?', answer: 'Moo!' };
      const res = await response(question_object, token, question_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if question ID valid but question ID not in DB', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_id = '10000';
      const question_object = { question: 'What does the cow say?', answer: 'Moo!' };
      const res = await response(question_object, token, question_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if question is invalid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question = await Question.create({ question: 'What does the cow say?', answer: 'Moo!' });
      const question_object = {};
      const res = await response(question_object, token, question.id);

      expect(res.status).toBe(400);
    });

    it('should update question if input is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question = await Question.create({ question: 'What does the cow say?', answer: 'Moo!' });
      const question_object = { question: 'What does the pig say?', answer: 'Oink!' };
      const res = await response(question_object, token, question.id);
      const result = await Question.findOne({ where: { id: question.id } });

      expect(result).toHaveProperty('question', 'What does the pig say?');
      expect(result).toHaveProperty('answer', 'Oink!');
    });

    it('should return updated question if it is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question = await Question.create({ question: 'What does the cow say?', answer: 'Moo!' });
      const question_object = { question: 'What does the pig say?', answer: 'Oink!' };
      const res = await response(question_object, token, question.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', question.id);
      expect(res.body).toHaveProperty('question', 'What does the pig say?');
      expect(res.body).toHaveProperty('answer', 'Oink!');
    });
  });

  describe('DELETE /ID', () => {
    const response = async (id, jwt) => {
      return await request
        .delete('/api/questions/' + id)
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const question_id = '1';
      const res = await response(question_id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const question_id = '1';
      const res = await response(question_id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid question ID', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_id = 'id';
      const res = await response(question_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if question ID valid but question ID not in DB', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question_id = '100000';
      const res = await response(question_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete question if input is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question = await Question.create({ question: 'What does the cow say?', answer: 'Moo!' });
      const res = await response(question.id, token);
      const result = await Question.findOne({ where: { id: question.id } });

      expect(result).toBeNull();
    });

    it('should return deleted question', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const question = await Question.create({ question: 'What does the cow say?', answer: 'Moo!' });
      const res = await response(question.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', question.id);
      expect(res.body).toHaveProperty('question', question.question);
      expect(res.body).toHaveProperty('answer', question.answer);
    });
  });
});
