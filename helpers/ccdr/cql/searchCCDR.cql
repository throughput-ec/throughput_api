// We want to match code repositories based on a full text search,
// repository name, or a set of linked keywords.
UNWIND $keywords AS kws
  CALL apoc.when(kws <> "",
    "MATCH (k:KEYWORD)
     WHERE toLower(k.keyword) = toLower($kws)
     RETURN DISTINCT k AS keywords",
    "MATCH (k:KEYWORD)
     RETURN DISTINCT k AS keywords",
    {kws:kws}) YIELD value
WITH DISTINCT value.keywords AS keywords
CALL apoc.when($name <> "",
  "MATCH (o:dataCat)
   WHERE toLower(o.name) CONTAINS(toLower($name))
   MATCH (o)<-[:Body]-(an:ANNOTATION)
   MATCH (kws)<-[:hasKeyword]-(an)
   OPTIONAL MATCH (o)<-[:Target]-(:ANNOTATION)-[:Target]->(cr:codeRepo)
   RETURN DISTINCT o AS ccdr, COLLECT(DISTINCT kws.keyword) AS keywords, COUNT(cr) AS count",
  "MATCH (kws)<-[:hasKeyword]-(:ANNOTATION)-[:Body]->(o:dataCat)
   MATCH (k)<-[:hasKeyword]-(:ANNOTATION)-[:Body]->(o)
   OPTIONAL MATCH (o)<-[:Target]-(:ANNOTATION)-[:Target]->(cr:codeRepo)
   RETURN DISTINCT o AS ccdr, COLLECT(DISTINCT k.keyword) AS keywords, COUNT(cr) AS count",
   {name:$name, kws:keywords}) YIELD value AS values
WITH values.ccdr AS ccdr, values.keywords AS keywords, values.count AS count
RETURN DISTINCT properties(ccdr) AS ccdrs, [x IN keywords WHERE x IN $keywords] AS keywords, count
ORDER BY SIZE(keywords) DESC, count DESC
SKIP toInteger($offset)
LIMIT toInteger($limit)
