// We want to match data catalogs using subjects based on one or more comma
// separated elements that are passed in as an array.
// We also want to have the ability to filter by object types.
// First we unwind the subjects (allowing an array of potential subjects)
// Then we check if people want types of a particular label (Article, code repo)
// Then use the limit and offset.

UNWIND $subjects AS subs
  CALL apoc.when(subs <> "",
    "MATCH (s:SUBJECT)
     WHERE k.subject CONTAINS($subs)
     RETURN DISTINCT s AS subjects",
    "MATCH (s:SUBJECT)
     RETURN DISTINCT s AS subjects",
    {subs:subs}) YIELD value
WITH DISTINCT value.subjects AS subjects
MATCH (subjects)<-[:hasSubject]-(n:ANNOTATION)-[:Target]->(o:dataCat)
WITH DISTINCT subjects.subject AS subjects, count(n) AS count
RETURN subjects, count
ORDER BY count DESC
SKIP toInteger($offset)
LIMIT toInteger($limit)
