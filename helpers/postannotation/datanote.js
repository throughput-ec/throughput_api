// Require Neo4j
const neo4j = require('neo4j-driver');
var fs = require('fs');
const path = require('path');
var jwt = require('jsonwebtoken');

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

function checktoken(token) {

  console.log('Checking token ' + token)

  if (token === undefined) {
    token = ""
  }
  const output = jwt.verify(token)
    .then(data => console.log(data))

  return output;
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
  module.exports.checktoken = checktoken;
