// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./../../pwbin.json')

console.log(pwbin);

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function nodesByType(req, res)
{

    types = "MATCH (n)-[:isType]-(t:TYPE) \
             RETURN DISTINCT(t.type) AS type, COUNT(n) AS nodes"

    const session = driver.session();

    const aa = session.readTransaction(tx => tx.run(types))
        .then(result =>
        {
            console.log(result.records)
            var output = result.records.map(x =>
            {
                return (
                {
                    type: x._fields[0],
                    count: Math.max(x._fields[1])
                })
            })
            res.status(200)
                .json(
                {
                    status: 'success',
                    data:
                    {
                        counts: output
                    },
                    message: 'Results.'
                })

        })
        .catch(function (err)
        {
            console.error(err);
        })

}


function totalAnnot(req, res)
{

    annos = "MATCH (n:ANNOTATION) \
             WITH date(datetime({epochmillis:n.created})) AS date \
             RETURN DISTINCT date.weekYear AS year, date.week AS week, COUNT(date) AS count \
             ORDER BY year DESC, week DESC \
             LIMIT 10"

    const session = driver.session();

    const aa = session.readTransaction(tx => tx.run(annos))
        .then(result =>
        {
            console.log(result.records)
            var output = result.records.map(x =>
            {
                return (
                {
                    year: Math.max(x._fields[0]),
                    week: Math.max(x._fields[1]),
                    annotations: Math.max(x._fields[2])
                })
            })
            res.status(200)
                .json(
                {
                    status: 'success',
                    data:
                    {
                        stats: output
                    },
                    message: 'Results.'
                })

        })
        .catch(function (err)
        {
            console.error(err);
        })

}


module.exports.nodesByType = nodesByType;
module.exports.totalAnnot = totalAnnot;