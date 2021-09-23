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

var pwbin = require('./../../pwbin.json');
const { token } = require('morgan');

// Create Driver
const driver = new neo4j.driver(pwbin.host,
  neo4j.auth.basic(pwbin.user, pwbin.password), {
    disableLosslessIntegers: true
  });

function checktptoken(req, res) {

  console.log(req.header('Authorization'))
  const verified = jwt.verify(req.header('Authorization'),
    process.env.TOKEN_SECRET,
    function (err, decoded) {
      res.status(403)
        .json({
          status: 'error',
          data: err,
          token: decoded,
          message: 'You must provide a valid token as a Bearer token in the call header.'
        });
    });

  return (verified);

}

function checkdb(req, res) {

  console.log('Checking dbid ' + req.body.dbid)
  if (req.body.dbid === undefined) {
    var dbid = "";

    // Kick out if there's no dbid set.
    res.status(400)
      .json({
        status: 'error',
        data: {
          dbid: dbid
        },
        message: 'Invalid database identifier.'
      });
  } else {

    dbid = req.body.dbid;
    const session = driver.session();

    session.run('MATCH (dc:dataCat) WHERE dc.id = $dbid \
                 RETURN COUNT(dc) AS count', {
        'dbid': dbid
      })
      .then(result => {
        var output = result.records[0].get(0)
        console.log(output)
        if (output > 0) {
          var a = 1;
        } else {
          res.status(400)
            .json({
              status: 'error',
              data: {
                dbid: dbid
              },
              message: 'Invalid database identifier.'
            });
        }
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(() => session.close());
  }
}

function datanote(req, res) {

  var input = {
    dbid: req.body.dbid,
    additionalType: req.body.additionalType,
    id: req.body.id,
    body: req.body.body
  }

  // Token pushes out a 403 if the token isn't validated.
  const token = checktptoken(req, res)
  const dbtoken = checkdb(req, res)

  input['orcid'] = token['orcid']['sub'];

  // Otherwise continue on:
  const fullPath = path.join(__dirname, 'cql/agent_post.cql');
  var textByLine = fs.readFileSync(fullPath).toString()

  const session = driver.session();

  const aa = session.run(textByLine, input)
    .then(result => {
      const username = token['family_name'] + ', ' + token['given_name'];
      const citeYear = new Date().getFullYear()
      var output = { annotationid: result['records'][0]['_fields'],
                     user: username,
                     year: citeYear,
                     };

      res.status(200)
        .json({
          status: 'success',
          data: {
            input: input,
            data: output
          },
          message: 'Added widget annotation.'
        })
    })
    .catch(function (err) {
      res.status(400)
        .json({
          status: 'error',
          data: {
            input: input,
            data: err
          },
          message: 'Everything is broken.'
        })
    })
    .finally(() => session.close())

}

module.exports.datanote = datanote;
module.exports.checktptoken = checktptoken;