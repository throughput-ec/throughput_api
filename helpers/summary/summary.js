// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function summaryType(req, res) {
  cypher_db = "MATCH (oa:dataCat'}) \
               WITH COUNT(DISTINCT oa) AS dbs \
               MATCH (ob:codeRepo) \
               WITH dbs, COUNT(DISTINCT ob) AS repos \
               MATCH (:dataCat)-[]-(a:ANNOTATION)-[]-(:codeRepo) \
               RETURN dbs, repos, COUNT(DISTINCT(a)) AS links"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_db))
    .then(result => {
      console.log(result.records)

      output = result.records.map(function(x) {
        return {
          database: Math.max(x['_fields'][0]),
          code: Math.max(x['_fields'][1]),
          links: Math.max(x['_fields'][2]),
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

module.exports.summaryType = summaryType;
