const express = require('express');
const router = express.Router();
const {findUserName, createUser} = require('../models/users');
const {getSession} = require('../dbUtils');

router.post('/create', async (req, res) => {
  const { userName, firstName, lastName, email } = req.body;
  try {
    const existingUsername = await findUserName(userName);
    if(existingUsername) {
      return res.status(400).send({
        status: 'failure',
        message: 'Username already taken'
      })
    }
    const createdUser = await createUser({userName, firstName, lastName, email});
    return res.status(201).send(createdUser.records[0].get(0).properties)
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: 'Something went wrong'
    })
  }
});

module.exports = router;
