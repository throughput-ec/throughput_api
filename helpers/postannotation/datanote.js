const neo4j = require('neo4j-driver');

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function checkToken(token) {
  const session = driver.session();
  console.log('Checking')
  output = session.run('MATCH (tk:TOKEN) WHERE tk.token = $token RETURN COUNT(tk) AS count', {token: token})
    .then(result => {
      if (result.count > 1) {
        return True
      } else {
        return False
      }
    });

  return output;

}

function datanote (req, res) {
  // A post function to add a note to a data record.
  console.log('Here')
  const session = driver.session();
  // Target can be one or many objects.  Right now only a single object is accepted.
  body = {}
  //req.body.json()

  // Needs elements:
  input = {
    dbid: body.dbid,
    orcid: body.orcid,
    dataid: body.dataid,
    level: body.level,
    body: body.body,
    token: body.token
  }

  var orcid = new RegExp("^(\\d{4}-\\d{4}-\\d{4}-\\d{3}[X|\\d])$");

  var checkToken = checkToken(input.token)
  console.log(checkToken)
  // Person is valid if an ORCID regex resolves.

  if (!orcid.test(body.orcid)) {
    res.status(500)
      .json({
        status: 'error',
        data: null,
        message: 'Posting user does not have a valid ORCID.'
      });
  };

  /* fetch('agent_posting.cql')
    .then(response => response.text())
    .then(cypher => {
        session.run(cypher, {orcid: body.orcid,
                             dbid: body.dbid,
                          dataid: 12,
                          level: 'site',
                          body: "Just trying out something"})
    })
    .then(result => {
      res.status(200)
        .json({
          status: 'success',
          data: result,
          message: 'Posted note'
        });
      session.close();
    });
  });
*/
}

module.exports.datanote = datanote;
