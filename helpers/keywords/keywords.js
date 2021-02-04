// Require Neo4j
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

function allkeywords(req, res) {
  /* Return all keywords and a count of the nuber of annotations associated with each. */

  const fullPath = path.join(__dirname, 'cql/keywordArray.cql');
  var textByLine = fs.readFileSync(fullPath).toString()

  params = {
    'keywords': [''],
    'label': '',
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
  if (!params.keywords === ['']) {
    params.keywords = params.keywords.split(',')
  }

  const session = driver.session();

  const aa = session.readTransaction(tx => tx.run(textByLine, params))
    .then(result => {
      output = parsedata(result.records)
      res.status(200)
        .json({
          status: 'success',
          data: {
            params: params,
            data: output
          },
          message: 'Returning Throughput keywords.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .finally(() => session.close())
}


function keywordsbyccdr(req, res) {

  passedKeys = Object.keys(req.query);


  query = "MATCH (k: KEYWORD)-[]-(:ANNOTATION)-[]-(o:dataCat) \
    WHERE o.id = $ccrd \
    RETURN DISTINCT k.keyword AS keyword"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(query, {
      ccrd: req.params.ccdr
    }))
    .then(result => {
      console.log(result.records)

      output = result.records.map(x => parsedata(x))

      res.status(200)
        .json({
          status: 'success',
          data: {
            keywords: output
          },
          message: 'Returned linked keywords.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}

function keywordsbyrepo(req, res) {

  passedKeys = Object.keys(req.query);


  query = "MATCH (k: KEYWORD)-[]-(:ANNOTATION)-[]-(o:codeRepo) \
    WHERE o.id = $repo \
    RETURN DISTINCT k.keyword AS keyword"

  const session = driver.session();

  const aa = session.readTransaction(tx => tx.run(query, {
      repo: req.params.repo
    }))
    .then(result => {
      console.log(result.records)

      output = result.records.map(x => parsedata(x))

      res.status(200)
        .json({
          status: 'success',
          data: {
            keywords: output
          },
          message: 'Returned linked keywords.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .finally(() => session.close())
}

module.exports.allkeywords = allkeywords;
