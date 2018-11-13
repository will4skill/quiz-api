const { Category, User, sequelize } = require('../../sequelize');
const generateAuthToken = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/categories', () => {
  afterEach(async () => {
    await Category.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let token;

    const response = async (jwt) => {
      return await request
        .get('/api/categories')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      const user = User.build({ admin: false });
      token = generateAuthToken(user);
      await Category.bulkCreate([{ name: 'books' }, { name: 'movies' }]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all categories (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.name === 'books')).toBeTruthy();
      expect(res.body.some(m => m.name === 'movies')).toBeTruthy();
    });
  });

  describe('GET /ID', () => {
    let user, token, category;

    const response = async (id, jwt) => {
      return await request
        .get(`/api/categories/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'School' });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(category.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(category.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid category ID', async () => {
      const category_id = 'id';
      const res = await response(category_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if category ID valid but category ID not in DB', async () => {
      const category_id = '10000';
      const res = await response(category_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific question if valid quiz and question ID', async () => {
      const res = await response(category.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', category.id);
      expect(res.body).toHaveProperty('name', category.name);
    });
  });

  describe('POST /', () => {
    let user, token, category_object;

    const response = async (object, jwt) => {
      return await request
        .post('/api/categories')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category_object = { name: 'books' };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(category_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(category_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if category is invalid', async () => {
      category_object = {};
      const res = await response(category_object, token);

      expect(res.status).toBe(400);
    });

    it('should save category if category is valid', async () => {
      const res = await response(category_object, token);
      const category = await Category.findOne({ where: { name: 'books' } });

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name', 'books');
    });

    it('should return category if category is valid', async () => {
      const res = await response(category_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'books');
    });
  });

  describe('PUT /ID', () => {
    let user, token, category, category_object;

    const response = async (object, jwt, id) => {
      return await request
        .put('/api/categories/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'books' });
      category_object = { name: 'movies' };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(category_object, token, category.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(category_object, token, category.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid category ID ', async () => {
      const category_id = 'id';
      const res = await response(category_object, token, category_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if category ID valid but not in DB', async () => {
      const category_id = '10000';
      const res = await response(category_object, token, category_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if category is invalid', async () => {
      const category_object = {};
      const res = await response(category_object, token, category.id);

      expect(res.status).toBe(400);
    });

    it('should update category if input is valid', async () => {
      const res = await response(category_object, token, category.id);
      const result = await Category.findOne({ where: { id: category.id } });

      expect(result).toHaveProperty('name', 'movies');
    });

    it('should return updated category if it is valid', async () => {
      const res = await response(category_object, token, category.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', category.id);
      expect(res.body).toHaveProperty('name', 'movies');
    });
  });

  describe('DELETE /ID', () => {
    let user, token, category;

    const response = async (id, jwt) => {
      return await request
        .delete('/api/categories/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = generateAuthToken(user);
      category = await Category.create({ name: 'books' });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(category.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = generateAuthToken(user);
      const res = await response(category.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid category ID', async () => {
      const category_id = 'id';
      const res = await response(category_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if category ID valid but not in DB', async () => {
      const category_id = '100000';
      const res = await response(category_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete category if input is valid', async () => {
      const res = await response(category.id, token);
      const result = await Category.findOne({ where: { id: category.id } });

      expect(result).toBeNull();
    });

    it('should return deleted category', async () => {
      const res = await response(category.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', category.id);
      expect(res.body).toHaveProperty('name', category.name);
    });
  });
});
