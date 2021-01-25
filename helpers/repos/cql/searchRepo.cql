// We want to match code repositories based on a full text search,
// repository name, or a set of linked keywords.
UNWIND $keywords AS kws
  CALL apoc.when(kws <> "",
    "MATCH (k:KEYWORD)
     WHERE k.keyword CONTAINS($kws)
     RETURN DISTINCT k AS keywords",
    "MATCH (k:KEYWORD)
     RETURN DISTINCT k AS keywords",
    {kws:kws}) YIELD value
WITH DISTINCT value.keywords AS keywords
CALL apoc.when($name <> "",
  "MATCH (o:codeRepo)
   WHERE o.name CONTAINS($name)
   MATCH (kws)<-[:hasKeyword]-(:ANNOTATION)-[:Body]->(o)
   RETURN DISTINCT o AS repo",
  "MATCH (kws)<-[:hasKeyword]-(:ANNOTATION)-[:Body]->(o:codeRepo)
   RETURN DISTINCT o AS repo",
   {name:$name, kws:keywords}) YIELD value AS values
RETURN values.repo AS repos
SKIP toInteger($offset)
LIMIT toInteger($limit)
