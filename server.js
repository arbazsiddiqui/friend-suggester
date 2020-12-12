const express = require('express');
const app = express(); 								// create our app w/ express
const port = process.env.PORT || 8080; 				// set the port
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const user = require('./routes/user');
const friends = require('./routes/friends');

app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

app.use((err, req, res, next) => {
  res.status(err.code || 500).send({
    status: 'error',
    message: err.message || 'Something went wrong'
  });
});

app.use('/api/v1/user', user);
app.use('/api/v1/friends', friends);

app.listen(port);
console.log(`App listening on port ${port}`);
