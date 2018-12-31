// Require Neo4j
const neo4j = require('neo4j-driver').v1;

var pwbin = require('./pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

// Express middleware
module.exports = function(req, res, next) {
    req.driver = driver;

    next();
};
