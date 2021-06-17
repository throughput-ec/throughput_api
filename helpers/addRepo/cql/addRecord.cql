MATCH (ty:TYPE {type: "schema:CodeRepository"})
MATCH (tyt:TYPE {type: "TextualBody"})
MATCH (mv:MOTIVATION) WHERE mv.term="linking"
MATCH (aty:AGENTTYPE {type:"Person"})
MERGE (ob:OBJECT {id: toInteger($ghid),
                  url: $ghurl,
                  description: $ghdescription,
                  name: $ghname})
ON CREATE SET ob.created = timestamp()
WITH ty, tyt, ob, mv, aty
MERGE (ty)<-[:isType]-(ob)
CREATE (ob)<-[:Target]-(a:ANNOTATION { created: timestamp() }) 
MERGE (mv)<-[:hasMotivation]-(a)
MERGE (a)-[:Body]->(obb:OBJECT {value: "Code repository contains a reference to the re3database record."})-[:isType]->(tyt)
MERGE (a)-[:Body]->(obc:OBJECT {value: $annoBody})-[:isType]->(tyt)
WITH a
MATCH (ot:dataCat {name: $odbname})
MERGE (ot)<-[:Target]-(a)
MERGE (ag:AGENT { id:$agid,
                  name: $agname}) <-[:isAgentType]-(aty)
ON CREATE SET ag.created = timestamp()
MERGE (ags:AGENT {name: "Throughput Code Cookbook",
                  homepage: "https://throughputdb.com/search"})<-[:isAgentType]- (aty)
WITH a, ag, ags
MERGE (ag)-[:Created {created: timestamp()}]->(a)
MERGE (ags)-[:Generated {generated: timestamp()}]->(a)
