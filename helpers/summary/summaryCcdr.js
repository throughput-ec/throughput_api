// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function summaryCcdrkw(req, res) {
  cypher_db = "MATCH (n:OBJECT)-[:isType]-(:TYPE {type:'schema:DataCatalog'}) \
               WITH n \
               MATCH (n)-[]-(:ANNOTATION)-[:hasKeyword]-(k:KEYWORD) \
               RETURN DISTINCT n.name AS name, n.description AS desc, COLLECT(DISTINCT k.keyword) AS keywords"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_db, {
      id: req.query.id
    }))
    .then(result => {
      console.log(result.records)

      output = result.records.map(function(x) {
        return {
          database: x['_fields'][0],
          description: x['_fields'][1],
          keywords: x['_fields'][2],
        }
      })
      res.status(200)
        .json({
          status: 'success',
          data: output,
          message: 'Returned summary of linked repositories.'
        })
    })
    .then(x => session.close())
    .catch(function(err) {
      console.error(err);
    })

}

function summaryCcdr(req, res) {

  passedKeys = Object.keys(req.query);

  if (req.query.id === undefined) {
    res.status(500)
  } else {
    req.query.id = req.query.id.split(',')
  }

  console.log(req.query)


  cypher_db = "MATCH (n:OBJECT)-[:isType]-(:TYPE {type:'schema:DataCatalog'}) \
                 WHERE  toLower(n.id) IN $id \
                  WITH n \
                  OPTIONAL MATCH (n)-[]-(:ANNOTATION)-[]-(o:OBJECT)-[:isType]-(:TYPE {type:'schema:CodeRepository'}) \
                  RETURN DISTINCT n.id AS id, COUNT(o) AS repos"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_db, {
      id: req.query.id
    }))
    .then(result => {
      const count = result.records.length;
      console.log(count)
      var db = '';

      if (count === 0) {
        res.status(200)
          .json({
            status: 'success',
            data: {
              count: 0
            },
            message: 'No databases match the supplied search string: ' + req.query.search
          })
      } else {
        console.log(result.records)

        output = result.records.map(function(x) {
          return {
            id: x['_fields'][0],
            count: Math.max(x['_fields'][1]),
          }
        })
        res.status(200)
          .json({
            status: 'success',
            data: output,
            message: 'Returned summary of linked repositories.'
          })
      }
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(x => session.close())


}

module.exports.summaryCcdr = summaryCcdr;
module.exports.summaryCcdrkw = summaryCcdrkw;
