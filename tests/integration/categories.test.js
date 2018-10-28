const { Category, User } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/muscles', () => {
  afterEach(async () => {
    await Category.destroy({ where: {} });
    // await server.close();
  });

  describe('GET /', () => {
    const response = async (jwt) => {
      return await request
        .get('/api/categories')
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all categories (stat code 200)', async () => {
      await Category.bulkCreate([ { name: 'books' }, { name: 'movies' }]);
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);

      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.name === 'books')).toBeTruthy();
      expect(res.body.some(m => m.name === 'movies')).toBeTruthy();
    });
  });

  describe('POST /', () => {
    const response = async (object, jwt) => {
      return await request
        .post('/api/categories')
        .send(object)
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const category_object = { name: 'books' };
      const res = await response(category_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const category_object = { name: 'books' };
      const res = await response(category_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if category is invalid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category_object = {};
      const res = await response(category_object, token);

      expect(res.status).toBe(400);
    });

    it('should save category if category is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category_object = { name: 'books' };
      const res = await response(category_object, token);
      const category = await Category.findOne({ where: { name: 'books' } });

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name', 'books');
    });

    it('should return category if category is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category_object = { name: 'books' };
      const res = await response(category_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'books');
    });
  });

  describe('PUT /ID', () => {
    const response = async (object, jwt, id) => {
      return await request
        .put('/api/categories/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const category_id = '1';
      const category_object = { name: 'books' };
      const res = await response(category_object, token, category_id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const category_id = '1';
      const category_object = { name: 'books' };
      const res = await response(category_object, token, category_id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid category ID ', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category_id = 'id';
      const category_object = { name: 'books' };
      const res = await response(category_object, token, category_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if category ID valid but not in DB', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category_id = '10000';
      const category_object = { name: 'books' };
      const res = await response(category_object, token, category_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if category is invalid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category = await Category.create({ name: 'books' });
      const category_object = {};
      const res = await response(category_object, token, category.id);

      expect(res.status).toBe(400);
    });

    it('should update category if input is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category = await Category.create({ name: 'books' });
      const category_object = { name: 'movies' };
      const res = await response(category_object, token, category.id);
      const result = await Category.findOne({ where: { id: category.id } });

      expect(result).toHaveProperty('name', 'movies');
    });

    it('should return updated category if it is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category = await Category.create({ name: 'books' });
      const category_object = { name: 'movies' };
      const res = await response(category_object, token, category.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', category.id);
      expect(res.body).toHaveProperty('name', 'movies');
    });
  });

  describe('DELETE /ID', () => {
    const response = async (id, jwt) => {
      return await request
        .delete('/api/categories/' + id)
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const category_id = '1';
      const res = await response(category_id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const category_id = '1';
      const res = await response(category_id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid category ID', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category_id = 'id';
      const res = await response(category_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if category ID valid but not in DB', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category_id = '100000';
      const res = await response(category_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete category if input is valid', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category = await Category.create({ name: 'books' });
      const res = await response(category.id, token);
      const result = await Category.findOne({ where: { id: category.id } });

      expect(result).toBeNull();
    });

    it('should return deleted category', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const category = await Category.create({ name: 'books' });
      const res = await response(category.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', category.id);
      expect(res.body).toHaveProperty('name', category.name);
    });
  });
});
