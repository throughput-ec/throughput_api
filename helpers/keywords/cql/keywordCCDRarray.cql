// We want to match data catalogs using keywords based on one or more comma
// separated elements that are passed in as an array.
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
MATCH (keywords)<-[:hasKeyword]-(n:ANNOTATION)-[:Body]-(o:dataCat)
WITH DISTINCT keywords.keyword AS keywords, count(n) AS count
RETURN keywords, count
ORDER BY count DESC
SKIP toInteger($offset)
LIMIT toInteger($limit)
