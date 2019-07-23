// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

console.log(pwbin);

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function searchNodes(req, res) {

  passedKeys = Object.keys(req.query);

  cypher = 'MATCH p=(n)-[*0..3]-(m)  \
            WHERE n.url =~ {search} AND  \
              \
            LABELS(m) <> "ANNOTATION" AND \
            n <> m RETURN p LIMIT {limit};'

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

module.exports.searchNodes = searchNodes;
