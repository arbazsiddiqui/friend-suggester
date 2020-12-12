const config = require('./config');
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(config.db.url, neo4j.auth.basic(config.db.userName, config.db.password));

const getSession = () => {
    return  driver.session();
};

module.exports = {
  getSession
};
