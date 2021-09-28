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
const {
  token
} = require('morgan');

// Create Driver
const driver = new neo4j.driver(pwbin.host,
  neo4j.auth.basic(pwbin.user, pwbin.password), {
    disableLosslessIntegers: true
  });

function checktptoken(req, res) {

  const verified = jwt.verify(req.header('Authorization'),
    process.env.TOKEN_SECRET,
    function (err, decoded) {
      return (decoded)
    });

  return (verified);
}

function checkdb(req) {

  if (req.body.dbid === undefined) {
    var dbid = "";
    var output = null;
  } else {

    dbid = req.body.dbid;
    const session = driver.session();

    output = session.run('MATCH (dc:dataCat) WHERE dc.id = $dbid \
                          RETURN properties(dc)', {
        'dbid': dbid
      })
      .then(result => {
        if (result.records[0].length > 0) {
          var output = result.records[0].get(0)
          return (output);
        } else {
          return (null)
        }
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(() => session.close());
  }
  return (output)
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

  if (token === undefined) {
    res.status(400)
      .json({
        status: 'failure',
        data: {
          input: input,
          data: null
        },
        message: 'Improper token.'
      })
  }

  const dbtoken = checkdb(req, res)
    .then(result => {
      if (result === null) {
        res.status(400)
          .json({
            status: 'failure',
            data: {
              input: input,
              data: null
            },
            message: 'Improper database identifier.'
          })
      } else {
        input['orcid'] = token['orcid']['sub'];
        var outvalue = result;

        // Otherwise continue on:
        const fullPath = path.join(__dirname, 'cql/agent_post.cql');
        var textByLine = fs.readFileSync(fullPath).toString()

        const session = driver.session();

        session.run(textByLine, input)
          .then(result => {
            const username = token['orcid']['family_name'] + ', ' + token['orcid']['given_name'];
            const citeYear = new Date().getFullYear()
            const citeDate = new Date().toLocaleDateString("en-CA")
            const db = 'Annotation for ' + outvalue['name'] + ', ' + input['additionalType'] + ': ' + input['id'] + '.'

            var output = {
              annotationid: result['records'][0]['_fields'],
              user: username,
              year: citeYear,
              cite: db,
              date: citeDate,
              publisher: "Throughput Annotation Database",
              url: "https://throughputdb.com/api/anno/" + result['records'][0]['_fields'][0]
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
}

module.exports.datanote = datanote;
module.exports.checktptoken = checktptoken;