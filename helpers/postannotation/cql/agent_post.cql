// Based on Web Annotation Example 12:
// https://www.w3.org/TR/annotation-model/#agents

MATCH (ats:AGENTTYPE {type:"SoftwareAgent"})
MATCH (agt:AGENTTYPE {type:"Person"})
MATCH (db:dataCat {id: $dbid })
MATCH (dsty:TYPE {type:'Dataset'})
MATCH (tyb:TYPE {type:'TextualBody'})
MATCH (mv:MOTIVATION {term:'describing'})
WITH ats, agt, db, dsty, tyb, mv
MERGE (ag:AGENT { id:$orcid })
ON CREATE SET ag.created = timestamp()
MERGE (ag)-[:isAgentType]->(agt)
MERGE (ags:AGENT { id:"http://throughputdb.com/",
                  name: "API v0.1 Annotation Widget",
                  homepage: "http://throughputdb.com"})
ON CREATE SET ags.created = timestamp()
MERGE (ags)-[:isAgentType]->(ats)
MERGE (ds:OBJECT {id: $id, additionalType: $additionalType})<-[:Contains]-(db)
MERGE (ds)-[:isType]->(dsty)
WITH ds, ag, ags, tyb, mv
CREATE (a:ANNOTATION {created: timestamp(), test: True})
CREATE (a)-[:Target]->(ds)
CREATE (a)<-[:Generated]-(ags)
CREATE (a)<-[:Created]-(ag)
CREATE (a)-[:hasMotivation]->(mv)
WITH a, tyb
CREATE (ob:OBJECT { value: $body, created: timestamp()})
CREATE (ob)-[:isType]->(tyb)
CREATE (ob)<-[:Body]-(a)
RETURN id(a)