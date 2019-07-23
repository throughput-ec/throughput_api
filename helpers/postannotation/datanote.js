// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function datanote (req, res) {
  // A post function to add a note to a data record.
  const session = driver.session();

  // Target can be one or many objects.  Right now only a single object is accepted.

  var tarinp = (function (raw) {
    try {
      return JSON.parse(raw);
    } catch(err) {
      res.status(500)
        .json({
          status: 'error',
          data: null,
          message: 'Target element not passed as valid JSON.'
        });
    }
  })(req.query.url);

  if (typeof tarinp === 'object') {
    var target = tarinp;
  } else {
    var target = [].concat(tarinp);
  }

  var body   = req.query.body;
  var url    = JSON.parse(req.query.url);
  var meta   = req.query.meta;
  var person = req.query.person;

  var orcid = new RegExp("^(\\d{4}-\\d{4}-\\d{4}-\\d{3}[X|\\d])$");

  const cypher = `
  CREATE (a:Annotation { created: timestamp() })

  MERGE (p:Person {id: {person}})
    ON CREATE SET p.created = timestamp()

  MERGE (b:Object {value: {body}})
    ON CREATE SET b.created = timestamp()

  MERGE (c:Object {url: {url}})
    ON CREATE SET c.created = timestamp()

  MERGE (p)-[:creates]->(a)-[:annotates]->(b)

  MERGE (a)-[:annotates]->(c)
  `

  // Person is valid if an ORCID regex resolves.

  if (!orcid.test(person)) {
    res.status(500)
      .json({
        status: 'error',
        data: null,
        message: 'Posting user does not have a valid ORCID.'
      });
  };

  target.map(function(x) {
    console.log(x)
    session.run(cypher, {person: person, body: body, url: x})
    .then(result => {
      res.status(200)
        .json({
          status: 'success',
          data: result,
          message: 'Posted note'
        });
      session.close();
    });
  });

}

module.exports.datanote = datanote;
