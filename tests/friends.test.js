const Promise = require('bluebird');
const request = require('request-promise');
const should = require('should');
const {getSession} = require('../dbUtils');
const {createUser, getAllFriends, becomeFriends} = require('../models/users');
const {getPendingFriendRequestForAUser, createFriendRequest} = require('../models/requests');

describe('Friends test', () => {
  describe('/add/:userA/:userB', () => {
    it('creates a friend request', async () => {
      const userDataA = {
        userName: "testA",
        firstName: "testA",
        lastName: "testA",
        email: "testA@gmail.com"
      };
      const userDataB = {
        userName: "testB",
        firstName: "testB",
        lastName: "testB",
        email: "testB@gmail.com"
      };

      //seed users
      await Promise.all([createUser(userDataA), createUser(userDataB)])

      const response = await request({
        url: `http://localhost:8080/api/v1/friends/add/${userDataA.userName}/${userDataB.userName}`,
        method: "POST",
        json: true
      });
      response.should.deepEqual({ status: 'success' })
      const pendingRequests = await getPendingFriendRequestForAUser(userDataB.userName);
      pendingRequests[0].get(0).properties.from.should.equal(userDataA.userName);
    });

    it('accepts a friend request if it exists', async () => {
      const userDataA = {
        userName: "testA",
        firstName: "testA",
        lastName: "testA",
        email: "testA@gmail.com"
      };
      const userDataB = {
        userName: "testB",
        firstName: "testB",
        lastName: "testB",
        email: "testB@gmail.com"
      };

      //seed users
      await Promise.all([createUser(userDataA), createUser(userDataB)])
      // seed a friend request from B to A
      await createFriendRequest(userDataB.userName, userDataA.userName);
      const response = await request({
        url: `http://localhost:8080/api/v1/friends/add/${userDataA.userName}/${userDataB.userName}`,
        method: "POST",
        json: true,
        simple: false
      });
      response.should.deepEqual({ status: 'success' });
      const pendingRequests = await getPendingFriendRequestForAUser(userDataB.userName);
      pendingRequests.should.deepEqual([])
      const friends = await getAllFriends(userDataA.userName);
      friends[0].get(0).properties.userName.should.equal(userDataB.userName)
    });
  });

  describe('/:userName', () => {
    it('gets all the friends of a user', async () => {
      const userDataA = {
        userName: "testA",
        firstName: "testA",
        lastName: "testA",
        email: "testA@gmail.com"
      };
      const userDataB = {
        userName: "testB",
        firstName: "testB",
        lastName: "testB",
        email: "testB@gmail.com"
      };

      //seed users
      await Promise.all([createUser(userDataA), createUser(userDataB)]);
      await becomeFriends(userDataA.userName, userDataB.userName);
      const response = await request({
        url: `http://localhost:8080/api/v1/friends/${userDataA.userName}`,
        method: "GET",
        json: true,
        simple: false
      });
      response.should.deepEqual([userDataB.userName])
    })
  });

  describe('/friendRequests/:userName', () => {
    it('gets all the friends requests of a user', async () => {
      const userDataA = {
        userName: "testA",
        firstName: "testA",
        lastName: "testA",
        email: "testA@gmail.com"
      };
      const userDataB = {
        userName: "testB",
        firstName: "testB",
        lastName: "testB",
        email: "testB@gmail.com"
      };

      //seed users
      await Promise.all([createUser(userDataA), createUser(userDataB)]);
      await createFriendRequest(userDataA.userName, userDataB.userName);
      const response = await request({
        url: `http://localhost:8080/api/v1/friends/friendRequests/${userDataB.userName}`,
        method: "GET",
        json: true,
        simple: false
      });
      response.should.deepEqual([userDataA.userName])
    })
  });

  describe('/suggestions/:userName', () => {
    it('gets suggested friends', async () => {
      const userDataA = {
        userName: "testA",
        firstName: "testA",
        lastName: "testA",
        email: "testA@gmail.com"
      };
      const userDataB = {
        userName: "testB",
        firstName: "testB",
        lastName: "testB",
        email: "testB@gmail.com"
      };
      const userDataC = {
        userName: "testC",
        firstName: "testC",
        lastName: "testC",
        email: "testC@gmail.com"
      };
      const userDataD = {
        userName: "testD",
        firstName: "testD",
        lastName: "testD",
        email: "testD@gmail.com"
      };

      //seed users
      await Promise.all([createUser(userDataA), createUser(userDataB), createUser(userDataC), createUser(userDataD)]);
      // seed friendships as A<->B, B<->C, C<->D
      await Promise.all([
        becomeFriends(userDataA.userName, userDataB.userName),
        becomeFriends(userDataB.userName, userDataC.userName),
        becomeFriends(userDataC.userName, userDataD.userName)
      ]);

      const responseA = await request({
        url: `http://localhost:8080/api/v1/friends/suggestions/${userDataA.userName}`,
        method: "GET",
        json: true,
        simple: false
      });
      //A -> C, D
      responseA.should.deepEqual([userDataC.userName, userDataD.userName]);

      const responseB = await request({
        url: `http://localhost:8080/api/v1/friends/suggestions/${userDataB.userName}`,
        method: "GET",
        json: true,
        simple: false
      });
      //B -> D
      responseB.should.deepEqual([userDataD.userName]);

      const responseD = await request({
        url: `http://localhost:8080/api/v1/friends/suggestions/${userDataD.userName}`,
        method: "GET",
        json: true,
        simple: false
      });
      //D -> A, B
      responseD.should.deepEqual([userDataB.userName, userDataA.userName]);
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
