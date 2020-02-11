// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

console.log(pwbin);

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function searchCcdrs(req, res) {

  passedKeys = Object.keys(req.query);

  cypher_ct = 'MATCH (n:OBJECT)-[:isType]-(:TYPE {type:"schema:DataCatalog"}) \
               WHERE n.name CONTAINS {search} \
               MATCH (o:OBJECT)-[:isType]-(:TYPE {type:"schema:CodeRepository"}) \
               WITH n, o \
               MATCH p=(n)-[]-(:ANNOTATION)-[:Target]-(o) \
               RETURN COUNT(p)'

  cypher = 'MATCH (n:OBJECT)-[:isType]-(:TYPE {type:"schema:DataCatalog"}) \
            WHERE n.name CONTAINS {search} \
            MATCH (o:OBJECT)-[:isType]-(:TYPE {type:"schema:CodeRepository"}) \
            WITH n, o \
            MATCH p=(n)-[]-(:ANNOTATION)-[:Target]-(o) \
            RETURN p \
            LIMIT {limit}'

  const session = driver.session();

  session.run(cypher, {search: req.query.search, limit: 30})
  .then(result => {
    res.status(200)
      .json({
        status: 'success',
        data: result,
        message: 'Searched for stuff.'
      });
    session.close();
  });

}

module.exports.searchCcdrs = searchCcdrs;
