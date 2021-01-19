// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

function parsedata(records) {
  // Takes in the fields from neo4j and turns them into a named object
  // Otherwise the keys and field values are split into different objects.
  result = {}
  for (var i = 0; i < records.length; i++) {
    result[records.keys[i]] = records._fields[i];
  }
  return result;
}

function commonParams(query) {
  result = {}

}

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function allkeywords(req, res) {
  /* Return all keywords and a count of the nuber of annotations associated with each. */

  cypher_st = "MATCH (k:KEYWORD) \
               MATCH (k)<-[:hasKeyword]-(n:ANNOTATION) \
               RETURN DISTINCT toLower(k.keyword) AS keyword, COUNT(n) AS links \
               ORDER BY links DESC \
               SKIP toInteger($offset) \
               LIMIT toInteger($limit)"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_st, {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keyword: req.query.keyword
    }))
    .then(result => {
      output = result.records.map(function(x) {
        sampler = {
          [x.keys[0]]: x._fields[0],
          [x.keys[1]]: Math.max(x._fields[1])
        }
        return (sampler)
      })

      res.status(200)
        .json({
          status: 'success',
          data: output,
          message: 'Returned linked repositories.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}

function ccdrkeywords(req, res) {
  /* Return all keywords for databases and a count of the nuber of annotations
     associated with each. */

  cypher_st = "MATCH (k:KEYWORD) \
               MATCH (db:dataCat) \
               MATCH (k)<-[:hasKeyword]-(n:ANNOTATION)-[:Body]->(db) \
               RETURN DISTINCT toLower(k.keyword) AS keyword, COUNT(n) AS links \
               ORDER BY links DESC \
               LIMIT $limit"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_st, {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keyword: req.query.keyword
    }))
    .then(result => {
      output = result.records.map(function(x) {
        sampler = {
          [x.keys[0]]: x._fields[0],
          [x.keys[1]]: Math.max(x._fields[1])
        }
        return (sampler)
      })

      res.status(200)
        .json({
          status: 'success',
          data: output,
          message: 'Returned linked repositories.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}

function repokeywords(req, res) {
  /* Return all keywords associated with code repositories and a count of the
     number of annotations associated with each. */

  cypher_st = "MATCH (k:KEYWORD)<-[:hasKeyword]-(n:ANNOTATION)-[:Body]->(:codeRepo) \
                 RETURN DISTINCT toLower(k.keyword) AS keyword, COUNT(n) AS links \
                 ORDER BY links DESC"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_st, {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keyword: req.query.keyword
    }))
    .then(result => {
      output = result.records.map(function(x) {
        sampler = {
          [x.keys[0]]: x._fields[0],
          [x.keys[1]]: Math.max(x._fields[1])
        }
        return (sampler)
      })

      res.status(200)
        .json({
          status: 'success',
          data: output,
          message: 'Returned linked repositories.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}

function keywords(req, res) {

  passedKeys = Object.keys(req.query);

  if (req.query.keyword === undefined) {
    req.query.keyword = "";
  }

  if (req.query.limit === undefined) {
    req.query.limit = 15;
  }

  if (req.query.limit > 50) {
    req.query.limit = 50;
  }

  if (req.query.offset === undefined) {
    req.query.offset = 0;
  }

  cypher_st = "MATCH (k:KEYWORD) \
               WHERE toLower(k.keyword) CONTAINS toLower($keyword) \
               WITH k \
               MATCH (k)<-[:hasKeyword]-(:ANNOTATION)-[]-(o) \
               WHERE o:dataCat OR o:codeRepo \
               WITH o, k \
               RETURN DISTINCT toLower(k.keyword) AS keyword, COUNT(DISTINCT o) AS resources \
               ORDER BY resources DESC \
               SKIP toInteger($offset) \
               LIMIT toInteger($limit)"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_st, {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keyword: req.query.keyword
    }))
    .then(result => {
      output = result.records.map(function(x) {
        sampler = {
          [x.keys[0]]: x._fields[0],
          [x.keys[1]]: Math.max(x._fields[1])
        }

        return (sampler)
      })

      res.status(200)
        .json({
          status: 'success',
          data: {
            keywords: output
          },
          message: 'Returned linked repositories.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
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
    .then(() => session.close())
}

module.exports.allkeywords = allkeywords;
module.exports.ccdrkeywords = ccdrkeywords;
module.exports.repokeywords = repokeywords;
module.exports.keywords = keywords;
module.exports.keywordsbyccdr = keywordsbyccdr;
module.exports.keywordsbyrepo = keywordsbyrepo;
