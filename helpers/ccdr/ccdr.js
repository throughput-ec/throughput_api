// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

console.log(pwbin);

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function searchCcdrs(req, res) {

  passedKeys = Object.keys(req.query);

  cypher_db = 'MATCH (n:OBJECT)-[:isType]-(:TYPE {type:"schema:DataCatalog"}) \
               WHERE toLower(n.name) CONTAINS toLower({search}) \
               RETURN n.name, n.description, n.url \
               LIMIT {limit}'

  cypher = 'MATCH (n:OBJECT)-[:isType]-(:TYPE {type:"schema:DataCatalog"}) \
            WHERE n.name = {search} \
            MATCH (o:OBJECT)-[:isType]-(:TYPE {type:"schema:CodeRepository"}) \
            WITH n, o \
            MATCH p=(n)-[]-(:ANNOTATION)-[:Target]-(o) \
            RETURN n.name, n.description, n.url, COLLECT({name:o.name, description:o.description, url:o.url}) \
            LIMIT {limit}'

  const session = driver.session();

  /* First, try to find the database itself. */

  session.run(cypher_db,
    { search: req.query.search, limit: parseInt(req.query.limit) })
  .then(result => {

    const count = result.records.length;
    var db = '';
    console.log(count)

    switch (count) {
      case 0:
        res.status(200)
          .json({
            status: 'success',
            data: { count: 0, database: null, repos: null },
            message: 'No databases match the supplied search string: ' + req.query.search
          });
        break;
      case 1:
        db = result.records[0]._fields;

        session.run(cypher, {search: db.name, limit: parseInt(req.query.limit)})
          .then(repos => {
            console.log(repos)
            const links = repos.records.map(function(x) {
              return {name: x._fields[0], description: x._fields[1], url: x._fields[2]}
            });

            res.status(200)
              .json({
                status: 'success',
                data: { count: count, database: db, repos: links },
                message: 'Returned linked repositories.'
              });
            });
        break;
      default:
        break;

    }

    res.status(200)
      .json({
        status: 'success',
        data: { count: count, database: db },
        message: 'Returned linked repositories.'
      });

  })
  .then(() => session.close());

}

module.exports.searchCcdrs = searchCcdrs;

/*

*/
