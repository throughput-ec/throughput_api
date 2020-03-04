// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function keywords(req, res) {

  passedKeys = Object.keys(req.query);

  if(req.query.keyword === undefined) {
    req.query.keyword = "";
  }

  if(req.query.limit === undefined) {
    req.query.limit = 15;
  }

  if(req.query.offset === undefined) {
    req.query.offset = 0;
  }

  if(req.query.stat === undefined) {
    req.query.stat = true;
  }

  console.log(req.query)

  cypher_st    = "MATCH (k:KEYWORD)-[]-(:ANNOTATION)-[]-(o:OBJECT)-[:isType]-(t:TYPE) \
                  WHERE  \
                  toLower(k.keyword) CONTAINS toLower({keyword}) AND \
                  t.type IN ['schema:CodeRepository','schema:DataCatalog'] \
                  RETURN DISTINCT toLower(k.keyword) AS keyword, COUNT(o) AS results \
                  ORDER BY results DESC \
                  SKIP {offset} \
                  LIMIT {limit}"

  cypher_ns    = "MATCH (k:KEYWORD)-[]-(:ANNOTATION)-[]-(o:OBJECT)-[:isType]-(t:TYPE) \
                  WHERE  \
                  toLower(k.keyword) CONTAINS toLower({keyword}) AND \
                  t.type IN ['schema:CodeRepository','schema:DataCatalog'] \
                  WITH DISTINCT toLower(k.keyword) AS keyword, t.type AS type, COLLECT({name: o.name, url: o.url}) AS reps \
                  RETURN keyword, type, reps \
                  ORDER BY SIZE (reps) DESC \
                  SKIP {offset} \
                  LIMIT {limit}"

  const session = driver.session();

  if(req.query.stat == true) {
    queryCall = cypher_st;
  } else {
    queryCall = cypher_ns;
  }

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(queryCall,
    { limit: parseInt(req.query.limit),
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
        message: 'No keywords match the supplied search string: ' + req.query.search
      })
    } else {
      console.log(result.records)

      output = result.records.map(function(x) {

        if(x['keys'].includes('results')) {
          output = { keyword: x['_fields'][0], count: Math.max(x['_fields'][1]) }
        } else {
          output = { keyword: x['_fields'][0],
                     type: x['_fields'][1],
                     resources: x['_fields'][2] }
        }

        return  output })
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

module.exports.keywords = keywords;
