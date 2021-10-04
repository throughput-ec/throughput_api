// Based on Web Annotation Example 12:
// https://www.w3.org/TR/annotation-model/#agents

MERGE (ob:OBJECT { id:$body })
ON CREATE SET ob.created = timestamp()
MERGE (ag:AGENT { id:$orcid}) -[:isAgentType]-> (:AGENTTYPE {type:"Person"})
ON CREATE SET ag.created = timestamp()
MERGE (ags:AGENT { id:"http://throughputdb.com/",
                  name: "API v0.1",
                  homepage: "http://throughputdb.com"}) -[:isAgentType]-> (:AGENTTYPE {type:"Software"})
ON CREATE SET ags.created = timestamp()
WITH ob, ags, ag
MERGE (ag)-[:Created {created: timestamp()}]->(a:ANNOTATION {created: timestamp()})-[:Body]->(ob)-[:isType]->(:TYPE {type: "TextualBody"})
MERGE (ags)-[:Generated {generated: timestamp()}]->(a)
WITH a
MERGE (ot:OBJECT {id: $target})
ON CREATE SET ot.created = timestamp()
MERGE (ott:OBJECT {id: $target})
ON CREATE SET ott.created = timestamp()
CREATE (ot)<-[:Target]-(a)-[:Target]->(ott)
