MATCH (an:ANNOTATION) WHERE id(an) = toInteger($annid)
OPTIONAL MATCH (an)<-[:Created]-(agc:AGENT)
OPTIONAL MATCH (an)<-[:Generated]-(agg:AGENT)
OPTIONAL MATCH (an)-[:Body]->(obb:OBJECT)
OPTIONAL MATCH (an)-[:Target]->(obt:OBJECT)
OPTIONAL MATCH (obb)-[:isType]->(tyb:TYPE)
OPTIONAL MATCH (obt)-[:isType]->(tyt:TYPE)
OPTIONAL MATCH (obt)<-[:Contains]-(db:OBJECT)-[:isType]-(dbt:TYPE {type:'schema:DataCatalog'})
WITH an, agc, agg, ({id: obb.id, name: obb.name, url: obb.url, type: tyb.type, value: obb.value}) AS body, 
                   COLLECT({id: obt.id, name: obt.name, additionalType: obt.additionalType, type: tyt.type, in: {name: db.name, type: dbt.type, url:db.url, id: db.id}}) AS targets
RETURN DISTINCT 
         $annid AS annotation,
        agc.id AS orcid,
        properties(agg) AS source,
        apoc.date.toISO8601(an.created) AS date,
        body AS body,
        targets AS targets