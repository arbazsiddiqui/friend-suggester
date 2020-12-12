const _ = require('lodash');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const {
  getExistingFriendRequest,
  getPendingFriendRequest,
  deleteFriendRequest,
  createFriendRequest,
  getPendingFriendRequestForAUser
} = require('../models/requests');

const {
  becomeFriends,
  findUserName,
  getAllFriends,
  getFriendsSuggestions
} = require('../models/users');

router.post('/add/:userA/:userB', async (req, res) => {
  const { userA: userNameA, userB: userNameB } = req.params;
  try {

    const [userA, userB] = await Promise.all([findUserName(userNameA), findUserName(userNameB)])
    if(_.isEmpty(userA) || _.isEmpty(userB)) {
      return res.status(400).send({
        status: 'failure',
        message: 'Invalid userNames'
      })
    }
    // check if A has already sent a request to B
    const existingFriendRequest = await getExistingFriendRequest(userNameA, userNameB);
    if(existingFriendRequest) {
      return res.status(400).send({
        status: 'failure',
        message: 'Friend request already sent'
      })
    }

    // check if B has already sent a request to A
    const acceptingFriendRequest = await getPendingFriendRequest(userNameA, userNameB);

    // create a new relationship b/w A and B and delete the pending friendRequest
    if(acceptingFriendRequest) {
      await becomeFriends(userNameA, userNameB);
      await deleteFriendRequest(userNameA, userNameB);
      return res.status(202).send({
        status: 'success',
      })
    }
    // else create a new friend request
    await createFriendRequest(userNameA, userNameB);
    return res.status(202).send({
      status: 'success',
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: 'Something went wrong'
    })
  }
});

router.get('/:userName', async (req, res) => {
  const { userName } = req.params;
  try {
    const existingUsername = await findUserName(userName);
    if(!existingUsername) {
      return res.status(400).send({
        status: 'failure',
        message: 'Username does not exists'
      })
    }
    const friends = await getAllFriends(userName);
    if(!_.isEmpty(friends)) {
      const friendUserNames = friends.map(friend => friend.get(0).properties.userName)
      return res.status(200).send(friendUserNames)
    }
    return res.status(404).send({
      status: 'failure',
      message: 'No friends found'
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: 'Something went wrong'
    })
  }
});

router.get('/friendRequests/:userName', async (req, res) => {
  const { userName } = req.params;
  try {
    const existingUsername = await findUserName(userName);
    if(!existingUsername) {
      return res.status(400).send({
        status: 'failure',
        message: 'Username does not exists'
      })
    }
    const friendRequests = await getPendingFriendRequestForAUser(userName);
    if(!_.isEmpty(friendRequests)) {
      const friendUserNames = friendRequests.map(friend => friend.get(0).properties.from);
      return res.status(200).send(friendUserNames)
    }
    return res.status(404).send({
      status: 'failure',
      message: 'No friends requests found'
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: 'Something went wrong'
    })
  }
});

router.get('/suggestions/:userName', async (req, res) => {
  const { userName } = req.params;
  try {
    const existingUsername = await findUserName(userName);
    if(!existingUsername) {
      return res.status(400).send({
        status: 'failure',
        message: 'Username does not exists'
      })
    }
    const suggestions = await getFriendsSuggestions(userName);
    if(!_.isEmpty(suggestions)) {
      const suggestionUserNames = suggestions.map(friend => friend.get(0).properties.userName);
      return res.status(200).send(suggestionUserNames)
    }
    return res.status(404).send({
      status: 'failure',
      message: 'No friends suggestions found'
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: 'Something went wrong'
    })
  }
});

module.exports = router;
