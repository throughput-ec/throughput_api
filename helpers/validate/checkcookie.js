// This is the module to manage the cookie:
// The user will send a valid ORCID cookie
// We will validate the cookie
// We will send back a jwt token using our secret key in our .env file with the ORCID ID.
// It will expire in 1 week.

// Require Neo4j
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

dotenv.config()

function checktoken(req, res) {
    const token = req.body.token;
    console.log(token);
    // We want to take in a token and check that we get something reasonable back.
    var tokenresolve = fetch('https://orcid.org/oauth/userinfo',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'User-Agent': 'throughputdb-API',
            'Accept': 'application/json'
        }})
        .then(res => res.text())
        .then(out => {return(JSON.parse(out))})
        .then(data => {
            if(Object.keys(data).includes('error')) {
                res.status(407)
                .json({
                    status: 'Proxy Authentication Required',
                    data: data,
                    message: 'The ORCID token passed to Throughput is not valid.'
                })
            } else {
                tdbtoken = jwt.sign({orcid: data}, process.env.TOKEN_SECRET, { expiresIn: '2s' });
                res.status(200)
                .json({
                    status: 'success',
                    data: {token: tdbtoken, user: data},
                    message: 'Throughput token expires in 1wk'
                })
            }
            })
            .catch(function(err) {
                console.error(err);
                res.status(500)
                  .json({
                    status: 'error',
                    data: err,
                    message: 'Failed to generate token.'
                  });
              });

    /*
  if (token === undefined) {
    token = ""
  }
  const output = jwt.verify(token)
    .then((data) => {
      jwt.sign()})

  return output;*/
}
/* 
function createtoken(orcid) {
  
  
  return jwt.sign(orcid, process.env.TOKEN_SECRET, { expiresIn: '1w' });
}

function createToken(req, res, next) {
    const passkey = process.env.TOKEN_SECRET;
    checktoken(res.body.token);
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
      console.log(err)

      if (err) return res.sendStatus(403)

      req.user = user

      next()
    })
  }
 */
module.exports.checktoken = checktoken;