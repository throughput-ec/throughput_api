// This is the module to manage the cookie:
// The user will send a valid ORCID cookie
// We will validate the cookie
// We will send back a jwt token using our secret key in our .env file with the ORCID ID.
// It will expire in 1 week.

// Require Neo4j
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

dotenv.config()

function checktoken(req, res) {
  const token = req.body.token;
  console.log(token);
  // We want to take in a token and check that we get something reasonable back.
  fetch('https://orcid.org/oauth/userinfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        //'User-Agent': 'throughputdb-API',
        'Accept': 'application/json'
      }
    })
    .then(res => {
      console.log(JSON.stringify(res));
      return (res.text())
    })
    .then(out => {
      return (JSON.parse(out))
    })
    .then(data => {
      console.log(data)
      if (Object.keys(data).includes('error')) {
        res.status(407)
          .json({
            status: 'Proxy Authentication Required',
            data: data,
            message: 'The ORCID token passed to Throughput is not valid:' + token
          })
      } else {
        var tdbtoken = jwt.sign({
            orcid: data
          },
          process.env.TOKEN_SECRET,
          {
            expiresIn: '1w'
          });
        res.status(200)
          .json({
            status: 'success',
            data: {
              token: tdbtoken,
              user: data
            },
            message: 'Throughput token expires in 1wk'
          });
      }
    })
    .catch(function (err) {
      console.error(err);
      res.status(500)
        .json({
          status: 'error',
          data: err,
          message: 'Failed to generate token.'
        });
    });
}

module.exports.checktoken = checktoken;