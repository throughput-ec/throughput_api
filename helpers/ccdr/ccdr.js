// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function searchCcdrs(req, res) {

  if (req.query.search === undefined) {
    req.query.search = "";
  }
  if (req.query.keyword === undefined) {
    req.query.keyword = "";
  }
  if (req.query.limit === undefined) {
    req.query.limit = 15;
  }
  if (req.query.offset === undefined) {
    req.query.offset = 0;
  }

  // Query for searching for a database by name:
  const cypher_db = "CALL db.index.fulltext.queryNodes('namesAndDescriptions', $search) \
               YIELD node, score \
               WHERE 'dataCat' IN labels(node) \
               WITH node \
               OPTIONAL MATCH (node)<-[:Target]-(:ANNOTATION)-[:Target]->(o:codeRepo) \
               RETURN DISTINCT node.id as id, \
                               node.name AS name, \
                               node.description AS description, \
                               node.url AS url, \
                               toInteger(SIZE(COLLECT(o))) AS code \
               SKIP toInteger($offset) \
               LIMIT toInteger($limit)"

  const cypher_db_kw = "MATCH (k:KEYWORD) \
                  WHERE \
                    ((toLower(k.keyword) CONTAINS toLower($keyword) OR $keyword = '')) \
                  WITH k \
                  MATCH (k)<-[:hasKeyword]-(:ANNOTATION)-[:Body]->(n:dataCat) \
                  WITH DISTINCT n \
                  OPTIONAL MATCH (n)<-[:Target]-(:ANNOTATION)-[:Target]->(o:codeRepo) \
                  RETURN DISTINCT n.id as id, \
                                  n.name AS name, \
                                  n.description AS description, \
                                  n.url AS url, \
                                  toInteger(SIZE(COLLECT(o))) AS code \
                  ORDER BY code DESC \
                  SKIP toInteger($offset) \
                  LIMIT toInteger($limit)"

  const session = driver.session();

  if (req.query.keyword == "") {
    queryCall = cypher_db;
    queryParam = {
        search: req.query.search,
        limit: parseInt(req.query.limit),
        offset: parseInt(req.query.offset),
      }
  } else {
    queryCall = cypher_db_kw;
    queryParam = {
        keyword: req.query.keyword,
        limit: parseInt(req.query.limit),
        offset: parseInt(req.query.offset),
      }
  }

  /* First, try to find the database itself. */
  console.log(queryParam)

  const aa = session.readTransaction(tx => tx.run(queryCall, queryParam))
    .then(result => {
      console.log(result)
    }).catch(err => {
      console.log(err.message);
    })
      /*
      const count = result.records.length;
      console.log(result)
      var db = '';

      if (count === 0) {
        res.status(200)
          .json({
            status: 'success',
            data: {
              count: 0,
              database: null,
              repos: null
            },
            message: 'No databases match the supplied search string: ' + req.query.search
          })
      } else {
        console.log(result.records)

        output = result.records.map(function(x) {
          return {
            id: x['_fields'][0],
            name: x['_fields'][1],
            description: x['_fields'][2],
            url: x['_fields'][3],
            repos: Math.max(x['_fields'][4])
          }
        })
        res.status(200)
          .json({
            status: 'success',
            data: {
              ccdrs: output
            },
            message: 'Returned linked repositories.'
          })
      }
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
    */
}

function ccdrLinks(req, res) {

  passedKeys = Object.keys(req.query);

  if (req.query.limit === undefined) {
    req.query.limit = 100;
  }

  if (req.query.id === undefined) {
    req.query.id = [];
  } else {
    req.query.id = req.query.id.split(',');
  }

  if (req.query.offset === undefined) {
    req.query.offset = 0;
  }

  console.log(req.query)

  cypher_db = "MATCH (o:codeRepo) \
               MATCH (n:dataCat) \
               WHERE  toLower(toString(n.id)) IN $id \
               WITH n, o \
               MATCH (n)<-[:Target]-(:ANNOTATION)-[:Target]->(o) \
               RETURN toString(o.id), \
                         o.name, \
                         o.description, \
                         o.url, \
                         COLLECT(DISTINCT n.name) AS dbs \
                  ORDER BY size(dbs) DESC \
                  SKIP toInteger($offset) \
                  LIMIT toInteger($limit)"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_db, {
      id: req.query.id,
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset)
    }))
    .then(result => {
      console.log(result.records)
      const count = result.records.length;

      var db = '';

      if (count === 0) {
        res.status(200)
          .json({
            status: 'success',
            data: {
              count: 0,
              database: null,
              repos: null
            },
            message: 'No databases match the supplied search string: ' + req.query.search
          })
      } else {
        console.log(result.records)

        output = result.records.map(function(x) {
          return {
            id: x['_fields'][0],
            name: x['_fields'][1],
            description: x['_fields'][2],
            url: x['_fields'][3],
            dbs: x['_fields'][4],
          }
        })
        res.status(200)
          .json({
            status: 'success',
            data: {
              ccdrs: output
            },
            message: 'Returned linked repositories.'
          })
      }
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}

module.exports.searchCcdrs = searchCcdrs;
module.exports.ccdrLinks = ccdrLinks;
