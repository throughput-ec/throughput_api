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
const driver = new neo4j.driver(pwbin.host,
  neo4j.auth.basic(pwbin.user, pwbin.password), {
    disableLosslessIntegers: true
  });

function searchCCDR(req, res) {

  /* Return all keywords and a count of the nuber of annotations associated with each. */

  const fullPath = path.join(__dirname, 'cql/searchCCDR.cql');
  var textByLine = fs.readFileSync(fullPath).toString()

  params = {
    'keywords': [''],
    'name': '',
    'offset': 0,
    'limit': 25
  }

  Object.keys(params).map(x => {
    if (!!req.query[x]) {
      params[x] = req.query[x]
    } else {
      params[x] = params[x]
    }
  })

  if (params.keywords[0] !== '') {
    params.keywords = params.keywords.split(',')
  }

  const session = driver.session();

  const aa = session.readTransaction(tx => tx.run(textByLine, params))
    .then(result => {

      output = parsedata(result.records).map(function(x) {
        var ccdr =  x['ccdrs'];
        ccdr['count'] = x['count'];
        ccdr['keywords'] = x['keywords'];

        return ccdr;
      });

      res.status(200)
          .json({
            status: 'success',
            data: {
              params: params,
              data: output
            },
            message: 'Returning Throughput databases.'
          })
    })
    .then(() => session.close())
    .catch(function(err) {
      console.log(err)
      res.status(500)
        .json({
          status: 'failure',
          data: {
            params: params,
            data: err
          }
        })
    })
}

module.exports.searchCCDR = searchCCDR;
