const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

function parsedata(records) {
  result = []
  for (var i = 0; i < Object.keys(records['records']).length; i++) {
    annotation = {}
    console.log(i)
    loopElem = records['records'][i]
    for (var j = 0; j < loopElem['length']; j++){
      annotation[loopElem['keys'][j]] = loopElem['_fields'][j];
    }
    result.push(annotation)
  }
  return result;
}

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function databaseAnnotation(req, res) {
  cypher = "MATCH (n:OBJECT)<-[:Body]-(an:ANNOTATION)-[:Target]->(db:OBJECT) \
            WHERE db.id = $id AND \
            (an)-[:hasMotivation]->(:MOTIVATION {term:'describing'}) AND \
            (n)-[:isType]->(:TYPE {type:'TextualBody'}) \
            WITH DISTINCT n, an, db \
              MATCH (an)-[:Created]->(agt:AGENT) \
            RETURN DISTINCT db.id AS database, \
                   'annotation' AS element, \
                       agt.name AS author, \
                         agt.id AS orcid, \
                       n.linkid AS link, \
                        n.level AS level, \
                        n.value AS annotation, \
                      apoc.date.toISO8601(n.created) AS date"

  const session = driver.session();

  session.run(cypher, {
      id: req.query.id
    })
    .then(result => {
      output = parsedata(result);
      console.log(output)
      res.status(200)
        .json({
          status: 'success',
          data: output,
          message: 'Searched for stuff.'
        });
      session.close();
    });

}

module.exports.databaseAnnotation = databaseAnnotation;
