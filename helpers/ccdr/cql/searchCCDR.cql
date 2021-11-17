// We want to match code repositories based on a full text search,
// repository name, or a set of linked keywords.
UNWIND $keywords AS kws
  CALL apoc.when(kws <> "",
    "MATCH (k:KEYWORD)
     WHERE toLower(k.keyword) CONTAINS(toLower($kws))
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
   OPTIONAL MATCH (k:KEYWORD)<-[:hasKeyword]-(an)
   OPTIONAL MATCH (o)<-[:Target]-(:ANNOTATION)-[:Target]->(cr:codeRepo)
   RETURN DISTINCT o AS ccdr, COLLECT(DISTINCT k.keyword) AS keywords, COLLECT(DISTINCT kws.keyword) AS matchedKeywords, COUNT(DISTINCT cr) AS count",
  "MATCH (o:dataCat)
   MATCH (kws)<-[:hasKeyword]-(an:ANNOTATION)-[:Body]->(o)
   OPTIONAL MATCH (k:KEYWORD)<-[:hasKeyword]-(an)
   OPTIONAL MATCH (o)<-[:Target]-(:ANNOTATION)-[:Target]->(cr:codeRepo)
   RETURN DISTINCT o AS ccdr, COLLECT(DISTINCT k.keyword) AS keywords,  COLLECT(DISTINCT kws.keyword) AS matchedKeywords, COUNT(DISTINCT cr) AS count",
   {name:$name, kws:keywords}) YIELD value AS values
WITH values.ccdr AS ccdr, values.keywords AS keywords, values.matchedKeywords AS matchedKeywords, values.count AS count
ORDER BY SIZE([x IN matchedKeywords WHERE x IN $keywords]) DESC, count DESC
RETURN DISTINCT properties(ccdr) AS ccdrs, keywords AS keywords, count
SKIP toInteger($offset)
LIMIT toInteger($limit)