// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function countDBbykw(req, res)
{

    passedKeys = Object.keys(req.query);

    if (req.query.keywords === undefined)
    {
        req.query.keywords = "";
    }
    else
    {
        req.query.keywords = req.query.keywords.split(',')
    }

    query = "MATCH(k: KEYWORD) \
    WHERE k.keyword IN $keywords \
    WITH k \
    MATCH(t: TYPE {type:'schema:DataCatalog'})-[: isType]-(o: OBJECT)-[]-(: ANNOTATION)-[]-(k) \
    RETURN k.keyword AS keyword, COUNT(o) AS count"

    const session = driver.session();

    /* First, try to find the database itself. */

    const aa = session.readTransaction(tx => tx.run(query,
        {
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            keywords: req.query.keywords
        }))
        .then(result =>
        {
            console.log(result.records)

            output = result.records.map(function (x)
            {
                var sampler = {}

                for (i = 0; i < x._fields.length; i++)
                {
                    sampler[x.keys[i]] = x._fields[i]
                }
                return (sampler)
            })

            res.status(200)
                .json(
                {
                    status: 'success',
                    data:
                    {
                        keywords: output
                    },
                    message: 'Returned database counts.'
                })
        })
        .catch(function (err)
        {
            console.error(err);
        })
}


function reposbykw(req, res)
{

    passedKeys = Object.keys(req.query);

    if (req.query.keywords === undefined)
    {
        req.query.keywords = "";
    }
    else
    {
        req.query.keywords = req.query.keywords.split(',')
    }

    if (req.query.limit === undefined)
    {
        req.query.limit = 15;
    }

    if (req.query.offset === undefined)
    {
        req.query.offset = 0;
    }

    query = " MATCH(k: KEYWORD) \
    WHERE k.keyword IN $keywords \
    WITH k \
    MATCH(t: TYPE)-[: isType]-(o: OBJECT)-[]-(: ANNOTATION)-[]-(k) \
    WHERE o.id IS NOT NULL \
    RETURN o.id AS id, \
         o.name AS name, \
  o.description AS description, \
         t.type AS type, \
      k.keyword AS keyword"

    const session = driver.session();

    /* First, try to find the database itself. */

    const aa = session.readTransaction(tx => tx.run(query,
        {
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            keywords: req.query.keywords
        }))
        .then(result =>
        {
            console.log(result.records)

            output = result.records.map(function (x)
            {
                var sampler = {}

                for (i = 0; i < x._fields.length; i++)
                {
                    sampler[x.keys[i]] = x._fields[i]
                }

                return (sampler)
            })

            res.status(200)
                .json(
                {
                    status: 'success',
                    data:
                    {
                        keywords: output
                    },
                    message: 'Returned linked repositories.'
                })
        })
        .catch(function (err)
        {
            console.error(err);
        })
}

function keywords(req, res)
{

    passedKeys = Object.keys(req.query);

    if (req.query.keyword === undefined)
    {
        req.query.keyword = "";
    }

    if (req.query.limit === undefined)
    {
        req.query.limit = 15;
    }

    if (req.query.offset === undefined)
    {
        req.query.offset = 0;
    }

    cypher_st = "MATCH (k:KEYWORD)-[]-(:ANNOTATION)-[]-(o:OBJECT)-[:isType]-(t:TYPE) \
                 WHERE t.type IN ['schema:CodeRepository', 'schema:DataCatalog'] AND \
                 toLower(k.keyword) CONTAINS toLower($keyword) \
                 WITH o \
                 MATCH (o)-[]-(:ANNOTATION)-[]-(a:KEYWORD) \
                 RETURN DISTINCT toLower(a.keyword) AS keyword, COUNT(toLower(a.keyword)) AS resources \
                 ORDER BY repos DESC \
                 SKIP $offset \
                 LIMIT $limit"

    const session = driver.session();

    /* First, try to find the database itself. */

    const aa = session.readTransaction(tx => tx.run(cypher_st,
        {
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            keyword: req.query.keyword
        }))
        .then(result =>
        {
            output = result.records.map(function (x)
            {
                sampler = {
                    [x.keys[0]]: x._fields[0],
                    [x.keys[1]]: Math.max(x._fields[1])
                }

                return (sampler)
            })

            res.status(200)
                .json(
                {
                    status: 'success',
                    data:
                    {
                        keywords: output
                    },
                    message: 'Returned linked repositories.'
                })
        })
        .catch(function (err)
        {
            console.error(err);
        })
}

function allkeywords(req, res)
{


    console.log(req.query)

    cypher_st = "MATCH (k:KEYWORD)-[]-(n:ANNOTATION) \
                 RETURN DISTINCT toLower(k.keyword) AS keyword, COUNT(n) AS links \
                 ORDER BY links DESC"

    const session = driver.session();

    /* First, try to find the database itself. */

    const aa = session.readTransaction(tx => tx.run(cypher_st,
        {
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            keyword: req.query.keyword
        }))
        .then(result =>
        {
            output = result.records.map(function (x)
            {
                sampler = {
                    [x.keys[0]]: x._fields[0],
                    [x.keys[1]]: Math.max(x._fields[1])
                }
                return (sampler)
            })

            res.status(200)
                .json(
                {
                    status: 'success',
                    data: output,
                    message: 'Returned linked repositories.'
                })
        })
        .catch(function (err)
        {
            console.error(err);
        })
}

module.exports.keywords = keywords;
module.exports.allkeywords = allkeywords;
module.exports.reposbykw = reposbykw;
module.exports.countDBbykw = countDBbykw;