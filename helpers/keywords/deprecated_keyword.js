
function countDBbykw(req, res) {

  passedKeys = Object.keys(req.query);

  if (req.query.keywords === undefined) {
    req.query.keywords = [""];
  } else {
    req.query.keywords = req.query.keywords.split(',')
  }

  query = "MATCH (k: KEYWORD) \
    WHERE k.keyword IN $keywords \
    WITH k \
    MATCH (o:dataCat)-[]-(: ANNOTATION)-[]-(k) \
    RETURN k.keyword AS keyword, COUNT(o) AS count"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(query, {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keywords: req.query.keywords
    }))
    .then(result => {
      console.log(result.records)

      output = result.records.map(function(x) {
        var sampler = {}

        for (i = 0; i < x._fields.length; i++) {
          sampler[x.keys[i]] = x._fields[i]
        }
        return (sampler)
      })

      res.status(200)
        .json({
          status: 'success',
          data: {
            keywords: output
          },
          message: 'Returned database counts.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}

function reposbykw(req, res) {
  // Code repositories associated with
  passedKeys = Object.keys(req.query);

  if (req.query.keywords === undefined) {
    req.query.keywords = "";
  } else {
    req.query.keywords = req.query.keywords.split(',')
  }

  if (req.query.limit === undefined) {
    req.query.limit = 15;
  }

  if (req.query.offset === undefined) {
    req.query.offset = 0;
  }

  query = "MATCH (k:KEYWORD) \
WHERE ANY(x in k.keyword WHERE ANY(y IN $keywords WHERE x = y)) \
WITH k \
MATCH (o:dataCat)-[]-(: ANNOTATION)-[]-(k) \
    WHERE o.id IS NOT NULL \
WITH o \
MATCH (o)-[]-(: ANNOTATION)-[]-(kw:KEYWORD) \
OPTIONAL MATCH (o)-[]-(: ANNOTATION)-[]-(n:codeRepo) \
    RETURN DISTINCT o.id AS id,  \
                  o.name AS name,  \
           o.description AS description, \
                   o.url AS url, \
               COLLECT(DISTINCT kw.keyword) AS keyword, \
               COUNT(DISTINCT n) AS linked \
    ORDER BY linked DESC"

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(query, {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset),
      keywords: req.query.keywords
    }))
    .then(result => {
      console.log(result.records)

      output = result.records.map(function(x) {
        var sampler = {}

        for (i = 0; i < x._fields.length; i++) {
          sampler[x.keys[i]] = x._fields[i]
          if (typeof sampler[x.keys[i]] == 'object' && !Array.isArray(sampler[x.keys[i]])) {
            sampler[x.keys[i]] = Math.max(sampler[x.keys[i]])
          }
        }

        return (sampler)
      })

      res.status(200)
        .json({
          status: 'success',
          data: {
            keywords: output
          },
          message: 'Returned linked repositories.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}


function dbkeywordmix(req, res) {

  /* Query to return linked keywords and associated counts. */

  cypher_any = "MATCH (n:dataCat)-[]-(:ANNOTATION)-[]-(k:KEYWORD) \
  WITH n, COLLECT(DISTINCT k.keyword) AS kws \
  WHERE ANY(x IN $keywords WHERE ANY(y IN kws WHERE x = y)) \
  MATCH (n)-[]-(:ANNOTATION)-[]-(a:codeRepo)-[]-(:ANNOTATION)-[]-(b:dataCat)-[]-(:ANNOTATION)-[:hasKeyword]-(kw:KEYWORD) \
  WHERE n < b \
  WITH DISTINCT b, COLLECT(DISTINCT kw.keyword) AS kws \
  UNWIND kws AS keywords \
  RETURN DISTINCT keywords, COUNT(keywords) AS count \
  ORDER BY count DESC"

  cypher_all = "MATCH (n:dataCat)-[]-(:ANNOTATION)-[]-(k:KEYWORD) \
  WITH n, COLLECT(DISTINCT k.keyword) AS kws \
  WHERE ALL(x IN $keywords WHERE ANY(y IN kws WHERE x = y)) \
  WITH kws \
  UNWIND kws AS keywords \
  RETURN DISTINCT keywords, COUNT(keywords) AS count \
  ORDER BY count DESC \
  "

  const session = driver.session();

  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(cypher_all, {
      keywords: req.query.keywords.split(',')
    }))
    .then(result => {
      output = result.records.map(function(x) {
        sampler = {
          [x.keys[0]]: x._fields[0],
          [x.keys[1]]: Math.max(x._fields[1])
        }
        return (sampler)
      })

      res.status(200)
        .json({
          status: 'success',
          data: output,
          message: 'Returned linked repositories.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}
