// Add a new github repository to an existing database.

const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host,
  neo4j.auth.basic(pwbin.user, pwbin.password), {
    disableLosslessIntegers: true
  });

function checktoken(token) {

    if (token === undefined) {
      token = ""
    }
  
    const output = jwt.decode(token)
  
    return output;
  }
  
function linkRepo(req, res) {

  const fullPath = path.join(__dirname, 'cql/addRecord.cql');
  var textByLine = fs.readFileSync(fullPath).toString()

  try {
    var inputParams = checktoken(req.query.token)
  } catch(error) {
    res.status(500)
      .json({
        status: 'failure',
        error: err,
        message: 'Invalid token.'
      })
  }
  
  /* We expect:
        orcid: The ORCID
        db: The database name
        repo: The repository metadata
        repoPurp: The reason
        annotationBody: Freeform text stuff
  */
  
  const params = {
      ghid: inputParams.repo.id,
      ghurl: inputParams.repo.html_url,
      ghdescription: inputParams.repo.description,
      ghname: inputParams.repo.full_name,
      annoBody: inputParams.annotationBody,
      // repometa: JSON.stringify(inputParams.repo),
      odbname: inputParams.db,
      agid: inputParams.orcid,
      agname: inputParams.orcidname
  }

  console.log(params)

  const session = driver.session();

  const aa = session.writeTransaction(tx => tx.run(textByLine, params))
    .then(result => {
      res.status(200)
        .json({
          status: 'success',
          message: 'Added annotations.'
        })
    })
    .then(() => session.close())
    .catch(function(err) {
      console.log(err)
      res.status(500)
        .json({
          status: 'failure',
          error: err
        })
    })
}

module.exports.linkRepo = linkRepo;