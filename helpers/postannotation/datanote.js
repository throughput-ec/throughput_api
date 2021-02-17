// Require Neo4j
const neo4j = require('neo4j-driver');
var fs = require('fs');
const path = require('path');

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
  output = session.run('MATCH (tk:TOKEN) WHERE tk.token = $token RETURN COUNT(tk) AS count', {
      'token': token
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

function checkdb(dbid) {

  console.log('Checking dbid ' + dbid)
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
    orcid: req.body.orcid,
    additionalType: req.body.additionalType,
    id: req.body.id,
    body: req.body.body,
    token: req.body.token
  }

  var orcid = new RegExp("^(\\d{4}-\\d{4}-\\d{4}-\\d{3}[X|\\d])$");

  checktoken(input.token)
    .then(result => {
      if (result == 0) {
        res.status(500)
          .json({
            status: 'error',
            data: null,
            message: 'Post does not contain a valid token in the BODY token.'
          });
      } else {
        // Person is valid if an ORCID regex resolves.
        checkdb(input.dbid)
          .then(result => {
            if (result == 0) {
              res.status(500)
                .json({
                  status: 'error',
                  data: null,
                  message: 'Post does not contain a valid database ID.'
                });
            } else {
              if (!orcid.test(req.body.orcid)) {
                res.status(500)
                  .json({
                    status: 'error',
                    data: null,
                    message: 'Posting user does not have a valid ORCID.'
                  });
              } else {
                // Everything works and we can do our work with the database:
                const fullPath = path.join(__dirname, 'cql/agent_post.cql');
                var textByLine = fs.readFileSync(fullPath).toString()
                session.run(textByLine, input)
                  .then(result => {
                    output = {
                      'modifications': cleanStats(result),
                      'parameters': input
                    }
                    res.status(200)
                      .json({
                        status: 'success',
                        data: output,
                        message: 'Posted note'
                      })
                    .then(() => {
                      session.close()
                    })
                  })
                  .catch(function(err) {
                    console.error(err)
                  })
              }
            }
          });
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
