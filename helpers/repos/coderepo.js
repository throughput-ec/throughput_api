// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function searchRepo(req, res) {

  passedKeys = Object.keys(req.query);

  if (req.query.search === undefined) {
    req.query.search = "";
  }

  if (req.query.keyword === undefined) {
    req.query.keyword = "";
  }

  if (req.query.limit === undefined) {
    req.query.limit = 15;
  }

  if (req.query.name === undefined) {
    req.query.name = "";
  }

  if (req.query.offset === undefined) {
    req.query.offset = 0;
  }

  console.log(req.query)

  cypher_db = "CALL db.index.fulltext.queryNodes('namesAndDescriptions', $search) \
               YIELD node, score \
               WHERE 'codeRepo' IN labels(node) \
               WITH node \
               OPTIONAL MATCH (node)<-[:Target]-(:ANNOTATION)-[:Target]->(o:dataCat) \
               RETURN DISTINCT node.id as id, \
                               node.name AS name, \
                               node.description AS description, \
                               node.url AS url, \
                               toInteger(SIZE(COLLECT(o))) AS dbs \
               SKIP toInteger($offset) \
               LIMIT toInteger($limit)"

  cypher_db_kw = "MATCH (k:KEYWORD)-[]-(:ANNOTATION)-[]-(n:codeRepo) \
                  WHERE  \
                  (toLower(k.keyword)) CONTAINS toLower($keyword) \
                  WITH DISTINCT n \
                  OPTIONAL MATCH (n)-[]-(:ANNOTATION)-[]-(o:dataCat) \
                  RETURN DISTINCT n.id, \
                         n.name AS name, \
                         n.description AS description, \
                         n.url AS url, \
                         toInteger(SIZE(COLLECT(o))) AS dbs \
                  ORDER BY dbs DESC \
                  SKIP toInteger($offset) \
                  LIMIT toInteger($limit)"

  const session = driver.session();

  if (req.query.keywords == "") {
    queryCall = cypher_db;
  } else {
    queryCall = cypher_db_kw;
  }

  const aa = session.readTransaction(tx => tx.run(queryCall, {
      search: req.query.search,
      name: req.query.name,
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keyword: req.query.keyword
    }))
    .then(result => {
      const count = result.records.length;
      console.log(count)
      var repo = '';

      if (count === 0) {
        res.status(200)
          .json({
            status: 'success',
            data: {
              count: 0,
              repos: null,
              database: null
            },
            message: 'No code repositories match the supplied search string: ' + req.query.search
          })
      } else {
        console.log(result.records)

        output = result.records.map(function(x) {

          return {
            id: Math.max(x['_fields'][0]),
            name: x['_fields'][1],
            description: x['_fields'][2],
            url: x['_fields'][3],
            dbs: Math.max(x['_fields'][4])
          }
        })
        res.status(200)
          .json({
            status: 'success',
            data: {
              repositories: output
            },
            message: 'Returned linked repositories.'
          })
      }
    })
    .then(x => driver.close())
    .catch(function(err) {
      console.error(err);
    })
}

module.exports.searchRepo = searchRepo;
