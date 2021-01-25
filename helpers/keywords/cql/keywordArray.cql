// We want to match keywords based on one or more comma separated elements
// that are passed in as an array.
// We also want to have the ability to filter by object types.
// First we unwind the keywords (allowing an array of potential keywords)
// Then we check if people want types of a particular label (Article, code repo)
// Then use the limit and offset.

UNWIND $keywords AS kws
  CALL apoc.when(kws <> "",
    "MATCH (k:KEYWORD)
     WHERE k.keyword CONTAINS($kws)
     RETURN DISTINCT k AS keywords",
    "MATCH (k:KEYWORD)
     RETURN DISTINCT k AS keywords",
    {kws:kws}) YIELD value
WITH DISTINCT value.keywords AS keywords
CALL apoc.when($label <> "",
  "MATCH (ty:TYPE) WHERE ty.type CONTAINS($label)
   MATCH (o:OBJECT)-[:isType]->(ty)
   MATCH (kws)<-[:hasKeyword]-(n:ANNOTATION)-[]-(o)
   RETURN DISTINCT kws.keyword AS keyword, COUNT(n) AS links",
  "MATCH (kws)<-[:hasKeyword]-(n:ANNOTATION)
   RETURN DISTINCT kws.keyword AS keyword, COUNT(n) AS links",
   {label:$label, kws:keywords}) YIELD value AS values
RETURN values.keyword AS keyword, values.links AS links
ORDER BY links DESC
SKIP toInteger($offset)
LIMIT toInteger($limit)
