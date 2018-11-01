const { User } = require('../../sequelize');
const server = require('../../index');
const request = require('supertest')(server);
const generateAuthToken = require('../../utilities/tokenUtility');

describe('/api/users', () => {
  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('GET /', () => {
    const response = async (jwt) => {
      return await request
        .get('/api/users')
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const res = await response(token);

      expect(res.status).toBe(403);
    });

    it('should return all users (stat code 200)', async () => {
      await User.bulkCreate([
        { name: 'bob' , email: 'bob@example.com', password_digest: 123456 },
        { name: 'tom' , email: 'tom@example.com', password_digest: 123456 }
      ]);

      const user = User.build({ admin: true });
      const token = generateAuthToken(user);

      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(u => u.name === 'bob')).toBeTruthy();
      expect(res.body.some(u => u.email === 'bob@example.com')).toBeTruthy();
      expect(res.body.some(u => u.name === 'tom')).toBeTruthy();
      expect(res.body.some(u => u.email === 'tom@example.com')).toBeTruthy();
    });
  });

  describe('POST /', () => {
    const response = async (object) => {
      return await request
        .post('/api/users')
        .send(object);
    };

    it('should return 400 if user is invalid', async () => {
      user_object = {
        email: 'bob@example.com',
        password: '123'
      };
      const res = await response(user_object);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user exists already', async () => {
      const first_user = User.build({
        name: 'bob',
        email: 'bob@example.com',
        password_digest: '123456'
      });
      await first_user.save();
      user_object = {
        name: 'bob',
        email: 'bob@example.com',
        password: '123456'
      };
      const res = await response(user_object);

      expect(res.status).toBe(400);
    });

    it('should save user if user is valid', async () => {
      user_object = {
        name: 'bob',
        email: 'bob@example.com',
        password: '123456'
      };
      const res = await response(user_object);
      const user = await User.findOne({ where: { name: 'bob' } });

      expect(res.status).toBe(200);
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name', 'bob');
      expect(user).toHaveProperty('email', 'bob@example.com');
      expect(user).toHaveProperty('password_digest');
    });

    it('should return jwt if user is valid', async () => {
      user_object = {
        name: 'bob',
        email: 'bob@example.com',
        password: '123456'
      };
      const res = await response(user_object);

      expect(res.header).toHaveProperty('x-auth-token');
    });
  });

  describe('GET /ME', () => {
    const response = async (jwt) => {
      return await request
        .get('/api/users/me')
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const res = await response(token);
      expect(res.status).toBe(401);
    });

    it('should return specific user if valid ID', async () => {
      const user = User.build({
        name: 'bob',
        email: 'bob@example.com',
        password_digest: '123456'
      });
      await user.save();
      const token = generateAuthToken(user);
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', user.name);
      expect(res.body).toHaveProperty('email', user.email);
    });
  });

  describe('PUT /ME', () => {
    const response = async (object, jwt) => {
      return await request
        .put('/api/users/me')
        .set('x-auth-token', jwt)
        .send(object);
    };

    it('should return 401 if client not logged in', async () => {
      const user_object = {
        name: 'bob',
        email: 'bob@example.com',
        password_digest: '123456'
      };
      const token = '';
      const res = await response(user_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if user is invalid', async () => {
      const user = User.build({
        name: 'bob',
        email: 'bob@example.com',
        password_digest: '123456'});
      await user.save();
      const token = generateAuthToken(user);
      const user_object = { name: '' };
      const res = await response(user_object, token);

      expect(res.status).toBe(400);
    });

    it('should update user if input is valid', async () => {
      const user = User.build({
        name: 'bob' ,
        email: 'bob@example.com',
        password_digest: '123456'
      });
      await user.save();
      const token = generateAuthToken(user);
      const user_object = { name: 'binky', email: 'binky@badbunny.com' }
      const res = await response(user_object, token);
      const result = await User.findById(user.id);

      expect(result).toHaveProperty('name', 'binky');
    });

    it('should return updated user if it is valid', async () => {
      const user = User.build({
        name: 'bob',
        email: 'bob@example.com',
        password_digest: '123456'
      });
      await user.save();
      const token = generateAuthToken(user);
      const user_object = { name: 'binky', email: 'binky@badbunny.com' }
      const res = await response(user_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'binky');
      expect(res.body).toHaveProperty('email', 'binky@badbunny.com');
    });
  });

  describe('DELETE /ID', () => {
    const response = async (id, jwt) => {
      return await request
        .delete('/api/users/' + id)
        .set('x-auth-token', jwt);
    };

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const user_id = '1';
      const res = await response(user_id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      const user = User.build({ admin: false });
      const token = generateAuthToken(user);
      const user_id = '1';
      const res = await response(user_id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid ID', async () => {
      const user = User.build({ admin: true });
      const token = generateAuthToken(user);
      const user_id = '1';
      const res = await response(user_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if id valid but ID not in DB', async () => {
      const user = User.build({
        name: 'bob',
        email: 'bob@example.com',
        admin: true,
        password_digest: '123456'
      });
      await user.save();
      const user_id = 500;
      const token = generateAuthToken(user);
      const res = await response(user_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete user if input is valid', async () => {
      const user = User.build({
        name: 'bob',
        email: 'bob@example.com',
        admin: true,
        password_digest: '123456'
      });
      await user.save();
      const token = generateAuthToken(user);

      const res = await response(user.id, token);
      const result = await User.findById(user.id);

      expect(result).toBeNull();
    });

    it('should return deleted user', async () => {
      const user = User.build({
        name: 'bob',
        email: 'bob@example.com',
        admin: true,
        password_digest: '123456'
      });
      await user.save();
      const token = generateAuthToken(user);
      const res = await response(user.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user.id);
      expect(res.body).toHaveProperty('name', user.name);
      expect(res.body).toHaveProperty('email', user.email);
    });
  });
});
