// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

function addBody (tx, params) {
  // Make sure the parameters are all permitted body parameters.

  Object.keys(params)

  return tx.run("MERGE (ob:OBJECT { id:$id, value: $value }) \
                 ON CREATE SET ob.created = timestamp()",
                 params)
}
