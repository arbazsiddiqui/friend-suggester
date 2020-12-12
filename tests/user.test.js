const request = require('request-promise');
const should = require('should');
const {getSession} = require('../dbUtils');
const {createUser} = require('../models/users');

require('../server');


describe('User tests', () => {
  describe('/create', () => {
    it('creates a user', async () => {
      const response = await request({
        url: `http://localhost:8080/api/v1/user/create`,
        body: {
          userName: "testA",
          firstName: "testA",
          lastName: "testA",
          email: "testA@gmail.com"
        },
        method: "POST",
        json: true
      });
      response.should.deepEqual({
        firstName: 'testA',
        lastName: 'testA',
        userName: 'testA',
        email: 'testA@gmail.com'
      })
    });

    it('throws if userName already exists', async () => {
      const userData = {
        userName: "testA",
        firstName: "testA",
        lastName: "testA",
        email: "testA@gmail.com"
      };
      await createUser(userData);
      const response = await request({
        url: `http://localhost:8080/api/v1/user/create`,
        body: userData,
        method: "POST",
        json: true,
        simple: false
      });
      response.should.deepEqual({ status: 'failure', message: 'Username already taken' })
    })
  });

  afterEach(async () => {
    // reset DB
    const session = getSession();
    await session.run(
      'match (a) -[r] -> () delete a, r'
    );
    await session.run(
      'match (a) delete a'
    );
  });
});
