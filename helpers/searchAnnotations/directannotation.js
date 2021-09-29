// This is the module to get distinct annotations.

// Require Neo4j
const neo4j = require('neo4j-driver');
var fs = require('fs');
const path = require('path');

function parsedata(records) {
    // Takes in the fields from neo4j and turns them into a named object
    // Otherwise the keys and field values are split into different objects.
    var test = records.map(x => {
        var out = {}
        for (var i = 0; i < x.keys.length; i++) {
            out[x.keys[i]] = x._fields[i];
        }
        return out;
    })
    return test;
}


var pwbin = require('./../../pwbin.json');

// Create Driver
const driver = new neo4j.driver(pwbin.host,
    neo4j.auth.basic(pwbin.user, pwbin.password), {
        disableLosslessIntegers: true
    });

function getannotation(req, res) {

    const fullPath = path.join(__dirname, 'cql/matchreturnanno.cql');
    var textByLine = fs.readFileSync(fullPath).toString()

    const annid = req.params.id
    const session = driver.session();

    session.readTransaction(tx => tx.run(textByLine, {
            annid: annid
        }))
        .then(result => {
            console.log(result)
            var output = parsedata(result.records);
            res.status(200)
                .json({
                    status: 'success',
                    data: output,
                    message: 'Returning data annotations.'
                })
        })
        .then(() => session.close())
        .catch(function (err) {
            console.log(err)
            res.status(500)
                .json({
                    status: 'failure',
                    data: err,
                    message: 'Searched for stuff.'
                })
        })

}

module.exports.getannotation = getannotation;