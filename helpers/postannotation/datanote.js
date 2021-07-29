// This is the module to manage the cookie:
// The user will send a valid ORCID cookie
// We will validate the cookie
// We will send back a jwt token using our secret key in our .env file with the ORCID ID.
// It will expire in 1 week.

// Require Neo4j
const neo4j = require('neo4j-driver');
var fs = require('fs');
const path = require('path');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config()

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host,
  neo4j.auth.basic(pwbin.user, pwbin.password), {
    disableLosslessIntegers: true
  });
const session = driver.session();

function cleanStats(result) {
  stats = result['summary']['counters']['_stats']
  output = Object.keys(stats)
    .filter(x => stats[x] > 0)
    .reduce((obj, key) => {
      obj[key] = stats[key];
      return obj;
    }, {});
  return output;
}

function checktptoken(req, res) {

  const authHeader = req.headers['authorization'].split(' ');

  const verified = jwt.verify(token=authHeader[1], 
    secretOrPublicKey=process.env.TOKEN_SECRET,
    function(err, decoded) {
      if (err) {
        var dummy = 1;
      }
    })

  if (verified === undefined) {
    res.status(401)
        .json({
          status: 'error',
          data: null,
          message: 'You must provide a valid token as a Bearer token in the call header.'
        });
  } else {
    res.status(200)
          .json({
            status: 'success',
            data: verified['orcid'],
            message: 'The token works.'
          });
  }

}


function checkdb(dbid) {

  console.log('Checking dbid ' + dbid)
  if (dbid === undefined) {
    dbid = ""
  }

  output = session.run('MATCH (dc:dataCat) WHERE dc.id = $dbid RETURN COUNT(dc) AS count', {
      'dbid': dbid
    })
    .then(result => {
      output = result.records[0].get(0)
      if (output > 0) {
        var response = 1
      } else {
        response = 0
      }
      console.log(response)
      return response
    });
  return output;
}

function datanote(req, res) {

  input = {
    dbid: req.body.dbid,
    additionalType: req.body.additionalType,
    id: req.body.id,
    body: req.body.body,
    token: req.body.token
  }

  const token = checktoken(input.token)
    .then(result => {
      if (result == 0) {
        res.status(500)
          .json({
            status: 'error',
            data: null,
            message: 'Post does not contain a valid token in the BODY token.'
          });
      } else {
        console.log('notoken')
      }
    })
    .catch(function(err) {
      console.error(err);
      res.status(500)
        .json({
          status: 'error',
          data: err,
          message: 'Failed to post note.'
        });
    })
}

module.exports.datanote = datanote;
module.exports.checktptoken = checktptoken;
