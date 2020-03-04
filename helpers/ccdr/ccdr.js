// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function searchCcdrs(req, res) {

  passedKeys = Object.keys(req.query);

  if(req.query.search === undefined) {
    req.query.search = "";
  }

  if(req.query.keyword === undefined) {
    req.query.keyword = "";
  }

  if(req.query.limit === undefined) {
    req.query.limit = 15;
  }

  if(req.query.name === undefined) {
    req.query.name = "";
  }

  if(req.query.offset === undefined) {
    req.query.offset = 0;
  }

  console.log(req.query)


  cypher_db    = "MATCH (n:OBJECT)-[:isType]-(:TYPE {type:'schema:DataCatalog'}) \
                  WHERE  \
                  (toLower(n.name) CONTAINS toLower({name}) OR {name} = '') AND \
                  (toLower(n.description) CONTAINS toLower({search}) OR {search} = '') \
                  WITH DISTINCT n \
                  OPTIONAL MATCH (n)-[]-(:ANNOTATION)-[]-(o:OBJECT)-[:isType]-(:TYPE {type:'schema:CodeRepository'}) \
                  RETURN DISTINCT n.name AS name, n.description AS description, n.url AS url, SIZE(COLLECT(o)) AS code \
                  ORDER BY code DESC \
                  SKIP {offset} \
                  LIMIT {limit}"

  cypher_db_kw = "MATCH (k:KEYWORD)-[]-(:ANNOTATION)-[]-(n:OBJECT)-[:isType]-(:TYPE {type:'schema:DataCatalog'}) \
                  WHERE  \
                  (toLower(n.name) CONTAINS toLower({name}) OR {name} = '') AND \
                  (toLower(n.description) CONTAINS toLower({search}) OR {search} = '') AND \
                  (toLower(k.keyword)) CONTAINS toLower({keyword}) \
                  WITH DISTINCT n \
                  OPTIONAL MATCH (n)-[]-(:ANNOTATION)-[]-(o:OBJECT)-[:isType]-(:TYPE {type:'schema:CodeRepository'}) \
                  RETURN DISTINCT n.name AS name, n.description AS description, n.url AS url, toInteger(SIZE(COLLECT(o))) AS code \
                  ORDER BY code DESC \
                  SKIP {offset} \
                  LIMIT {limit}"

  const session = driver.session();

  if(req.query.keyword == "") {
    queryCall = cypher_db;
  } else {
    queryCall = cypher_db_kw;
  }

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(queryCall,
    { search: req.query.search,
      name: req.query.name,
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keyword: req.query.keyword }))
  .then(result => {
    const count = result.records.length;
    console.log(count)
    var db = '';

    if(count === 0) {
      res.status(200)
      .json({
        status: 'success',
        data: { count: 0, database: null, repos: null },
        message: 'No databases match the supplied search string: ' + req.query.search
      })
    } else {
      console.log(result.records)

      output = result.records.map(function(x) {
        return {name: x['_fields'][0],
                description: x['_fields'][1],
                url: x['_fields'][2],
                repos: Math.max(x['_fields'][3])} })
      res.status(200)
      .json({
        status: 'success',
        data: { ccdrs: output },
        message: 'Returned linked repositories.'
      })
    }
  })
  .catch(function(err) {
    console.error(err);
  })
}

module.exports.searchCcdrs = searchCcdrs;
