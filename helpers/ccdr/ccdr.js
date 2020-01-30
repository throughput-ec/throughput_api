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

  console.log(req.query)

  cypher_db = "MATCH (k:KEYWORD)-[]-(:ANNOTATION)-[]-(n:OBJECT)-[:isType]-(:TYPE {type:'schema:DataCatalog'}) \
               MATCH (o:OBJECT)-[:isType]-(:TYPE {type:'schema:CodeRepository'}) \
               WITH n, o, k \
               MATCH p=(n)-[]-(:ANNOTATION)-[:Target]-(o) \
               WHERE  \
                 (toLower(n.name) CONTAINS toLower({name}) OR {name} = '') AND \
                 (toLower(n.description) CONTAINS toLower({search}) OR {search} = '') AND \
                 (toLower(k.keyword) CONTAINS toLower({keyword}) OR {keyword} = '') \
               WITH DISTINCT n.name AS nameo \
               LIMIT 20 \
      	MATCH (m:OBJECT)-[:isType]-(:TYPE {type:'schema:DataCatalog'}) \
                  WHERE m.name IN nameo \
                  MATCH (o:OBJECT)-[:isType]-(:TYPE {type:'schema:CodeRepository'}) \
                  WITH m, o  \
                  MATCH p=(m)-[]-(:ANNOTATION)-[:Target]-(o)  \
                  RETURN m.name, m.description, m.url, COLLECT({name:o.name, description:o.description, url:o.url})"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_db,
    { search: req.query.search,
      name: req.query.name,
      limit: parseInt(req.query.limit),
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
                repos: x['_fields'][3]} })
      res.status(200)
      .json({
        status: 'success',
        data: { ccdrs: output },
        message: 'Returned linked repositories.'
      })
    }
  })
  .catch(function(err) {
    console.error(error);
  })
}

module.exports.searchCcdrs = searchCcdrs;
