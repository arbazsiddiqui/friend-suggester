const {getSession} = require('../dbUtils');

const findUserName = async (userName) => {
  const session = getSession();
  const user = await session.run(
    'MATCH (n:User) ' +
    'Where n.userName = $userName ' +
    'return n;',
    { userName }
  );
  if(user.records[0] && user.records[0].get(0)) {
    return user.records[0].get(0)
  }
  return false
};

const createUser = ({userName, firstName, lastName, email}) => {
  const session = getSession();
  return session.run(
    'CREATE (a:User {userName: $userName, firstName: $firstName, lastName: $lastName, email: $email}) RETURN a',
    { userName, firstName, lastName, email }
  )
};

const becomeFriends = (userA, userB) => {
  const session = getSession();
  return session.run(
    'Match(a:User), (b:User) ' +
    'where a.userName=$userA and b.userName=$userB ' +
    'create (a)-[f:friendsWith]->(b) ' +
    'return a;',
    { userA, userB }
  );
};

const getAllFriends = async (userName) => {
  const session = getSession();
  const friends = await session.run(
    'Match (a:User {userName: $userName})-[:friendsWith]-(b:User) ' +
    'return b;',
    { userName }
  );
  if(friends.records) {
    return friends.records
  }
  return false
};

const getFriendsSuggestions = async (userName) => {
  const session = getSession();
  // this query finds all the friends with 2 and 3 degrees.
  // degree 1 here means friend itself
  const friends = await session.run(
    'Match (a:User {userName: $userName})-[:friendsWith*2..3]-(b:User) ' +
    'return b;',
    { userName }
  );
  if(friends.records) {
    return friends.records
  }
  return false
};

module.exports = {
  findUserName,
  createUser,
  becomeFriends,
  getAllFriends,
  getFriendsSuggestions
};
