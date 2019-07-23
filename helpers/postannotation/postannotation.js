
// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var fs = require("fs");

var pwbin = require('./../../pwbin.json')

var agentds = fs.readFileSync('./cql/agent_post_')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function postannotation (req, res) {

  const session = driver.session(neo4j.session.WRITE);

  var tester = author(req.query.person);
  console.log(tester);

  const cypher = `
  CREATE (a:Annotation { created: timestamp() })
  MERGE (p:Person {id: {person}})
  MERGE (b:Object {value: {body}})
  MERGE (c:Object {url: {$target}})
  MERGE (p)-[:creates]-(a)-[:annotates]-(b)
  MERGE (a)-[:annotates]-(c)
  `
/*
  session.run(cyph2, annotationElem)
    .then(result => {
      console.log('Added node.');
      res.status(200).send(result);
    })
    .catch(e => {
      res.status(500).send(e);
    })
    .then(() => {
      console.log('Closing.')
      return session.close();
    }
  )
*/

}

module.exports.postannotation = postannotation;
