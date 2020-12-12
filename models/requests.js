const {getSession} = require('../dbUtils');

const createFriendRequest = (from, to) => {
  const session = getSession();
  return session.run(
    'CREATE (a:FriendRequest {from: $from, to: $to}) RETURN a',
    { from, to }
  )
};

const getExistingFriendRequest = async (from, to) => {
  const session = getSession();
  const friendRequest = await session.run(
    'MATCH (n:FriendRequest) ' +
    'Where n.from = $from AND n.to = $to ' +
    'return n;',
    { from, to }
  );

  if(friendRequest.records[0] && friendRequest.records[0].get(0)) {
    return friendRequest.records[0].get(0)
  }
  return false
};

const getPendingFriendRequest = async (from, to) => {
  const session = getSession();
  const friendRequest = await session.run(
    'MATCH (n:FriendRequest) ' +
    'Where n.from = $to AND n.to = $from ' +
    'return n;',
    { from, to }
  );

  if(friendRequest.records[0] && friendRequest.records[0].get(0)) {
    return friendRequest.records[0].get(0)
  }
  return false
};

const deleteFriendRequest = async (from, to) => {
  const session = getSession();
  return session.run(
    'MATCH (n:FriendRequest) ' +
    'Where n.from = $to AND n.to = $from ' +
    'delete n;',
    { from, to }
  );
};

const getPendingFriendRequestForAUser = async (userName) => {
  const session = getSession();
  const friendRequests = await session.run(
    'MATCH (n:FriendRequest) ' +
    'Where n.to = $userName ' +
    'return n;',
    { userName }
  );

  if(friendRequests.records) {
    return friendRequests.records
  }
  return false
};

module.exports = {
  getExistingFriendRequest,
  getPendingFriendRequest,
  deleteFriendRequest,
  createFriendRequest,
  getPendingFriendRequestForAUser
};
