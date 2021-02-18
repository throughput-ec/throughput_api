const neo4j = require('neo4j-driver');
var fs = require('fs');
const path = require('path');

var pwbin = require('./../../pwbin.json')

function parsedata(records) {
  // Takes in the fields from neo4j and turns them into a named object
  // Otherwise the keys and field values are split into different objects.
  var test = records.map(x => {
    var out = {}
    for (i = 0; i < x.keys.length; i++) {
      out[x.keys[i]] = x._fields[i];
    }
    return out;
  })
  return test;
}

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function databaseAnnotation(req, res) {

  /* Return all keywords and a count of the nuber of annotations associated with each. */

  const fullPath = path.join(__dirname, 'cql/findDatasetAnno.cql');
  var textByLine = fs.readFileSync(fullPath).toString()

  params = {
    'dbid': '',
    'ccdr': '',
    'additionalType': '',
    'id': '',
    'offset': 0,
    'limit': 25
  }

  if(typeof req.body.length == 'undefined') {
    // Check to see if there is a body element.
    Object.keys(params).map(x => {
      if (!!req.query[x]) {
        params[x] = req.query[x]
      } else {
        params[x] = params[x]
      }
    })
  } else {
    Object.keys(params).map(x => {
      if (!!req.body[x]) {
        params[x] = req.body[x]
      } else {
        params[x] = params[x]
      }
    })
  }

  if (params.dbid === '' & params.ccdr !== '') {
    params.dbid = params.ccdr;
  }

  const session = driver.session();

  const aa = session.readTransaction(tx => tx.run(textByLine, params))
    .then(result => {
      output = parsedata(result.records);
      res.status(200)
        .json({
          status: 'success',
          data: output,
          message: 'Returning data annotations.'
        })
    })
    .then(() => session.close())
    .catch(function(err) {
      console.log(err)
      res.status(500)
        .json({
          status: 'failure',
          data: err,
          message: 'Searched for stuff.'
        })
    })
}

module.exports.databaseAnnotation = databaseAnnotation;
