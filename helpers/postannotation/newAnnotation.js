// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

function addBody (tx, params) {
  // Make sure the parameters are all permitted body parameters.

  return tx.run("MERGE (ob:OBJECT { id:$id, value: $value }) \
                 ON CREATE SET ob.created = timestamp()",
                 params)
}

function addTPAgent (tx) {
  // Make sure the parameters are all permitted body parameters.

  return tx.run("MERGE (ags:AGENT { id:'http://throughputdb.com/', \
                    name: 'API v0.1',                              \
                    homepage: 'http://throughputdb.com'}) <-[:isAgentType]- (:AGENTTYPE {type:'Software'}) \
                 ON CREATE SET ags.created = timestamp()",
                 params)
}

function addAgent (tx, params) {
  // Should look for ORCID . . .
  return tx.run("MERGE (ag:AGENT { id:$orcid}) <-[:isAgentType]- (:AGENTTYPE {type:'Person'}) \
                 ON CREATE SET ag.created = timestamp()",
               params)
}

const session1 = driver.session(neo4j.WRITE);
const first =  session1.writeTransaction(tx => addTPAgent(tx))
  .then( () => session1.writeTransaction(tx => addAgent(tx, {orcid: "0000-0000-0000-0001"})))
  .then( () => session1.writeTransaction(tx => addEmployee(tx, 'Alice', 'Wayne Enterprises')))
  .then( () => {
    savedBookmarks.push(session1.lastBookmark());

    return session1.close();
  });
