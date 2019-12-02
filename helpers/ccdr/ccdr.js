// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function searchCcdrs(req, res) {

  passedKeys = Object.keys(req.query);

  cypher_db = 'MATCH (n:OBJECT)-[:isType]-(:TYPE {type:"schema:DataCatalog"}) \
               WHERE toLower(n.name) CONTAINS toLower({search}) \
               RETURN n.name, n.description, n.url \
               LIMIT {limit}'

  cypher = 'MATCH (n:OBJECT)-[:isType]-(:TYPE {type:"schema:DataCatalog"}) \
            WHERE n.name IN {search} \
            MATCH (o:OBJECT)-[:isType]-(:TYPE {type:"schema:CodeRepository"}) \
            WITH n, o  \
            MATCH p=(n)-[]-(:ANNOTATION)-[:Target]-(o) \
            RETURN n.name, n.description, n.url, COLLECT({name:o.name, description:o.description, url:o.url}) \
            LIMIT {limit}'

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_db,
    { search: req.query.search, limit: parseInt(req.query.limit) }))
  .then(result => {
    const count = result.records.length;
    var db = '';

    if(count === 0) {
      res.status(200)
      .json({
        status: 'success',
        data: { count: 0, database: null, repos: null },
        message: 'No databases match the supplied search string: ' + req.query.search
      })
    } else {
        var data = result.records.map(x =>  x._fields[0] )

        const sessionnew = driver.session();

        const repos = sessionnew.readTransaction(tx =>
           tx.run(cypher, { search: data, limit: parseInt(req.query.limit) })
        )
        .then(repos => {
          const links = repos.records.map(x => { return {
            name: x._fields[0], description: x._fields[1],
            url: x._fields[2],
            repos: x._fields[3] }})
          return(links)
        })
        .then(links => {
          console.log(links)
            res.status(200)
            .json({
              status: 'success',
              data: { ccdrs: links },
              message: 'Returned linked repositories.'
            })
        })


    }

    })
  }

module.exports.searchCcdrs = searchCcdrs;
