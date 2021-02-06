MATCH (tyd:TYPE {type:'Dataset'})
MATCH (tyb:TYPE {type:'TextualBody'})
MATCH (db:dataCat)
  WHERE ($dbid = '' OR db.id = $dbid)
WITH tyd, tyb, db
MATCH (db)-[:Contains]->(ob:OBJECT)
  WHERE (ob)-[:isType]->(tyd)
    AND ($additionalType = '' OR ob.additionalType = $additionalType)
    AND ($id = '' OR ob.id = $id)
WITH ob, db, tyb
MATCH (ob)<-[:Target]-(an:ANNOTATION)
MATCH (an)-[:Body]->(n:OBJECT)
//  WHERE (n)-[:isType]->(tyb)
WITH DISTINCT n, an, db, ob
MATCH (an)-[:Created]->(agt:AGENT)
RETURN DISTINCT db.id AS ccdr,
  'annotation' AS object,
  'textualBody' AS type, 
  agt.name AS annotationauthor,
  agt.id AS orcid,
  ob.id AS id,
  ob.additionalType AS additionalType,
  n.value AS annotation,
  apoc.date.toISO8601(n.created) AS date
SKIP toInteger($offset)
LIMIT toInteger($limit)
