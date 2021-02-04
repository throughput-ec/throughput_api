UNWIND $ccdrs AS ccdr
  MATCH (o:dataCat)<-[:Target]-(:ANNOTATION)-[:Target]->(cr:codeRepo)
  WHERE o.id = ccdr
RETURN DISTINCT properties(cr) AS repo, COLLECT(DISTINCT o.name) AS ccdrs
ORDER BY SIZE(ccdrs) DESC
