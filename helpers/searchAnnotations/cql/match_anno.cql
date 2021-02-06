MATCH (mv:MOTIVATION {term:'describing'})
MATCH (db:dataCat)
MATCH (tyb:TYPE {type:'TextualBody'})
WHERE db.id = $dbid
WITH db, mv
MATCH (mv)<-[:hasMotivation]-(an:ANNOTATION)
MATCH (an)-[:Target]->(db)
WITH db, an
MATCH (an)-[:Body]->(n:OBJECT)
WHERE (n)-[:isType]->(tyb)
AND ($link = '' OR n.linkid = $link)
          AND ($level = '' OR n.additionalType = $additionalType)
          WITH DISTINCT n, an, db \
            MATCH (an)-[:Created]->(agt:AGENT) \
          RETURN DISTINCT db.id AS database, \
                 'annotation' AS element, \
                     agt.name AS author, \
                       agt.id AS orcid, \
                     n.linkid AS link, \
                      n.level AS level, \
                      n.value AS annotation, \
                    apoc.date.toISO8601(n.created) AS date
