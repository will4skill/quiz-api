const { User } = require('../sequelize');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/users', () => {
  afterEach(async () => {
    await User.deleteMany({});

    // await server.close();
  });

  // afterAll(() => {
  //   mongoose.connection.db.dropDatabase(() => {
  //     mongoose.connection.close();
  //   });
  // });

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
      const token = new User({ admin: false }).generateAuthToken();
      const res = await response(token);

      expect(res.status).toBe(403);
    });

    it('should return all users (stat code 200)', async () => {
      const users = [
        { name: 'bob' , email: 'bob@example.com' },
        { name: 'tom' , email: 'tom@example.com' }
      ]
      await User.collection.insertMany(users);

      const token = new User({ admin: true }).generateAuthToken();
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
        name: '',
        email: 'bob@example.com',
        password: '123'
      };
      const res = await response(user_object);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user exists already', async () => {
      const first_user = new User({
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
      const user = await User.findOne({ name: 'bob' });

      expect(res.status).toBe(200);
      expect(user).toHaveProperty('_id');
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
      const user = new User({
        name: 'bob',
        email: 'bob@example.com',
        password_digest: '123456'
      });
      await user.save();
      const token = user.generateAuthToken();
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
      const user = new User({
        name: 'bob',
        email: 'bob@example.com',
        password_digest: '123456'});
      await user.save();
      const token = user.generateAuthToken();
      const user_object = { name: '' };
      const res = await response(user_object, token);

      expect(res.status).toBe(400);
    });

    it('should update user if input is valid', async () => {
      const user = new User({
        name: 'bob' ,
        email: 'bob@example.com',
        password_digest: '123456'
      });
      await user.save();
      const token = user.generateAuthToken();
      const user_object = { name: 'binky', email: 'binky@badbunny.com'}
      const res = await response(user_object, token);
      const result = await User.findById(user.id);

      expect(result).toHaveProperty('name', 'binky');
    });

    it('should return updated user if it is valid', async () => {
      const user = new User({ name: 'bob' , email: 'bob@example.com' , password_digest: '123456'});
      const token = user.generateAuthToken();
      await user.save();
      const user_object = { name: 'binky', email: 'binky@badbunny.com'}
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
      const token = new User({ admin: false }).generateAuthToken();
      const user_id = '1';
      const res = await response(user_id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid ID', async () => {
      const token = new User({ admin: true }).generateAuthToken();
      const user_id = '1';
      const res = await response(user_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if id valid but ID not in DB', async () => {
      const user = new User({
        name: 'bob',
        email: 'bob@example.com',
        admin: true,
        password_digest: '123456'
      });
      await user.save();
      const user_id = mongoose.Types.ObjectId();
      const token = user.generateAuthToken();
      const res = await response(user_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete user if input is valid', async () => {
      const user = new User({
        name: 'bob',
        email: 'bob@example.com',
        admin: true,
        password_digest: '123456'
      });
      await user.save();
      const token = user.generateAuthToken();

      const res = await response(user._id, token);
      const result = await User.findById(user._id);

      expect(result).toBeNull();
    });

    it('should return deleted user', async () => {
      const user = new User({
        name: 'bob',
        email: 'bob@example.com',
        admin: true,
        password_digest: '123456'
      });
      await user.save();
      const token = user.generateAuthToken();
      const res = await response(user._id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', user._id.toHexString());
      expect(res.body).toHaveProperty('name', user.name);
      expect(res.body).toHaveProperty('email', user.email);
    });
  });
});
