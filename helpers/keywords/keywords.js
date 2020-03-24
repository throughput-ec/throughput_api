// Require Neo4j
const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

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

    console.log(req.query)

    cypher_st = "MATCH (k:KEYWORD)-[]-(:ANNOTATION)-[]-(o:OBJECT)-[:isType]-(t:TYPE) \
                 WHERE t.type IN ['schema:CodeRepository', 'schema:DataCatalog'] AND \
                 toLower(k.keyword) CONTAINS toLower({keyword}) \
                 WITH o \
                 MATCH (o)-[]-(:ANNOTATION)-[]-(a:KEYWORD) \
                 RETURN DISTINCT toLower(a.keyword) AS keyword, COUNT(toLower(a.keyword)) AS resources \
                 ORDER BY repos DESC \
                 SKIP {offset} \
                 LIMIT {limit}"

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
        .then(x => driver.close())
        .catch(function (err)
        {
            console.error(err);
        })
}

module.exports.keywords = keywords;
module.exports.allkeywords = allkeywords;