// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function summaryType(req, res) {
  cypher_db = "MATCH (o) \
               WITH LABELS(o)[0] AS types \
               RETURN DISTINCT types, COUNT(types) AS count"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_db))
    .then(result => {
      console.log(result.records)

      output = result.records.map(function(x) {
        return {
          types: x['_fields'][0],
          count: Math.max(x['_fields'][1])
        }
      })
      res.status(200)
        .json({
          status: 'success',
          data: output,
          message: 'Returned summary of linked repositories.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(x => session.close())

}


function summaryTypeAgent(req, res) {

  types = "MATCH (o:OBJECT)-[:Created|Generated]->(n:AGENT)-[:isAgentType]->(t:AGENTTYPE) \
             RETURN DISTINCT(t.type) AS type, COUNT(o) AS nodes"

  const session = driver.session();

  const aa = session.readTransaction(tx => tx.run(types))
    .then(result => {
      console.log(result.records)
      var output = result.records.map(x => {
        return ({
          type: x._fields[0],
          count: Math.max(x._fields[1])
        })
      })
      res.status(200)
        .json({
          status: 'success',
          data: {
            counts: output
          },
          message: 'Results.'
        })

    })
    .catch(function(err) {
      console.error(err);
    })
    .then(x => driver.close())

}


module.exports.summaryType = summaryType;
module.exports.summaryTypeAgent = summaryTypeAgent;
