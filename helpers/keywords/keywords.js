// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

function parsedata(records) {
  result = {}
  for (var i = 0; i < records.length; i++) {
    result[records.keys[i]] = records._fields[i];
  }
  return result;
}

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

/* Functions give:
    - all keywords with the count of all annotations (allkeywords)
    - all keywords with the count of all databases (dbkeywords)
    - all keywords with the count of all repositories (repokeywords)
*/

function allkeywords(req, res) {
  /* Return all keywords and a count of the nuber of annotations associated with each. */

  cypher_st = "MATCH (k:KEYWORD)<-[:hasKeyword]-(n:ANNOTATION) \
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

function dbkeywords(req, res) {
  /* Return all keywords and a count of the nuber of annotations associated with each. */

  cypher_st = "MATCH (k:KEYWORD)<-[:hasKeyword]-(n:ANNOTATION)-[:Body]->(:dataCat) \
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


function repokeywords(req, res) {
  /* Return all keywords and a count of the nuber of annotations associated with each. */

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


function countDBbykw(req, res) {

  passedKeys = Object.keys(req.query);

  if (req.query.keywords === undefined) {
    req.query.keywords = [""];
  } else {
    req.query.keywords = req.query.keywords.split(',')
  }

  query = "MATCH (k: KEYWORD) \
    WHERE k.keyword IN $keywords \
    WITH k \
    MATCH (o:dataCat)-[]-(: ANNOTATION)-[]-(k) \
    RETURN k.keyword AS keyword, COUNT(o) AS count"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(query, {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keywords: req.query.keywords
    }))
    .then(result => {
      console.log(result.records)

      output = result.records.map(function(x) {
        var sampler = {}

        for (i = 0; i < x._fields.length; i++) {
          sampler[x.keys[i]] = x._fields[i]
        }
        return (sampler)
      })

      res.status(200)
        .json({
          status: 'success',
          data: {
            keywords: output
          },
          message: 'Returned database counts.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}

function reposbykw(req, res) {
  // Code repositories associated with
  passedKeys = Object.keys(req.query);

  if (req.query.keywords === undefined) {
    req.query.keywords = "";
  } else {
    req.query.keywords = req.query.keywords.split(',')
  }

  if (req.query.limit === undefined) {
    req.query.limit = 15;
  }

  if (req.query.offset === undefined) {
    req.query.offset = 0;
  }

  query = "MATCH (k:KEYWORD) \
WHERE ANY(x in k.keyword WHERE ANY(y IN $keywords WHERE x = y)) \
WITH k \
MATCH (o:dataCat)-[]-(: ANNOTATION)-[]-(k) \
    WHERE o.id IS NOT NULL \
WITH o \
MATCH (o)-[]-(: ANNOTATION)-[]-(kw:KEYWORD) \
OPTIONAL MATCH (o)-[]-(: ANNOTATION)-[]-(n:codeRepo) \
    RETURN DISTINCT o.id AS id,  \
                  o.name AS name,  \
           o.description AS description, \
                   o.url AS url, \
               COLLECT(DISTINCT kw.keyword) AS keyword, \
               COUNT(DISTINCT n) AS linked \
    ORDER BY linked DESC"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(query, {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keywords: req.query.keywords
    }))
    .then(result => {
      console.log(result.records)

      output = result.records.map(function(x) {
        var sampler = {}

        for (i = 0; i < x._fields.length; i++) {
          sampler[x.keys[i]] = x._fields[i]
          if (typeof sampler[x.keys[i]] == 'object' && !Array.isArray(sampler[x.keys[i]])) {
            sampler[x.keys[i]] = Math.max(sampler[x.keys[i]])
          }
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

function dbkeywordmix(req, res) {

  /* Query to return linked keywords and associated counts. */

  cypher_any = "MATCH (n:dataCat)-[]-(:ANNOTATION)-[]-(k:KEYWORD) \
  WITH n, COLLECT(DISTINCT k.keyword) AS kws \
  WHERE ANY(x IN $keywords WHERE ANY(y IN kws WHERE x = y)) \
  MATCH (n)-[]-(:ANNOTATION)-[]-(a:codeRepo)-[]-(:ANNOTATION)-[]-(b:dataCat)-[]-(:ANNOTATION)-[:hasKeyword]-(kw:KEYWORD) \
  WHERE n < b \
  WITH DISTINCT b, COLLECT(DISTINCT kw.keyword) AS kws \
  UNWIND kws AS keywords \
  RETURN DISTINCT keywords, COUNT(keywords) AS count \
  ORDER BY count DESC"

  cypher_all = "MATCH (n:dataCat)-[]-(:ANNOTATION)-[]-(k:KEYWORD) \
  WITH n, COLLECT(DISTINCT k.keyword) AS kws \
  WHERE ALL(x IN $keywords WHERE ANY(y IN kws WHERE x = y)) \
  WITH kws \
  UNWIND kws AS keywords \
  RETURN DISTINCT keywords, COUNT(keywords) AS count \
  ORDER BY count DESC \
  "

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_all, {
      keywords: req.query.keywords.split(',')
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


function keywordbyccdr(req, res) {

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

function keywordbyrepo(req, res) {

  passedKeys = Object.keys(req.query);


  query = "MATCH (k: KEYWORD)-[]-(:ANNOTATION)-[]-(o:codeRepo) \
    WHERE o.id = $repo \
    RETURN DISTINCT k.keyword AS keyword"

  const session = driver.session();

  /* First, try to find the database itself. */

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
module.exports.dbkeywords = dbkeywords;
module.exports.repokeywords = repokeywords;
module.exports.reposbykw = reposbykw;
module.exports.countDBbykw = countDBbykw;
module.exports.dbkeywordmix = dbkeywordmix;
module.exports.keywords = keywords;
module.exports.keywordbyccdr = keywordbyccdr;
module.exports.keywordbyrepo = keywordbyrepo;
