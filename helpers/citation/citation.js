// Require Neo4j
const neo4j = require('neo4j-driver');
const Cite = require('citation-js')

function parsedata(records) {
  result = {}
  for (var i = 0; i < records.length; i++) {
    result[records.keys[i]] = records._fields[i];
  }
  return result;
}

var pwbin = require('./../../pwbin.json')

// Create Driver
const driver = new neo4j.driver(pwbin.host, neo4j.auth.basic(pwbin.user, pwbin.password));

function citations(req, res) {

  passedKeys = Object.keys(req.query);

  if (req.query.ids === undefined) {
    req.query.ids = "";
  } else {
    req.query.ids = req.query.ids.split(',')
  }

  query = "MATCH (o:OBJECT) \
            WHERE toString(o.id) IN $ids \
            WITH o \
            MATCH (t: TYPE)-[: isType]-(o) \
            WHERE t.type IN ['schema:CodeRepository','schema:DataCatalog'] \
            WITH o, t \
            OPTIONAL MATCH (o)-[]-(ag:AGENT)-[]-(at:AGENTTYPE) \
            WHERE at IN ['Person', 'Organization'] \
           RETURN COLLECT(ag) AS author, o.name AS title, toString(o.id) AS id, o.url AS url, t.type AS type"

  const session = driver.session();
  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(query, {
      ids: req.query.ids
    }))
    .then(result => {
      console.log(result.records)
      output = result.records.map(function(x) {
        records = parsedata(x)
        auths = []
        for (var i = 0; i < records.author.length; i++) {
          auths.append({
            name: records.author[i]
          })
        }
        if (records.author.length == 0) {
          auths = [{
            name: 'n/a'
          }]
        }

        var today = new Date();

        records['author'] = auths;
        records['link'] = [{
          url: records['url']
        }];
        records['type'] = 'article';
        records['year'] = 2020;
        if (/.*github\.com.*/.test(records.url)) {
          records['publisher'] = 'GitHub'
          records['journal'] = {
            name: 'GitHub Repository'
          }
        }
        if (/r3d/.test(records.id)) {
          records['doi'] = 'https://doi.org/10.17616/' + records.id;
          records['journal'] = {
            name: 'Re3Data.org'
          }

        }
        let output = new Cite(records);
        console.log(output)
        let date = (new Date()).toLocaleDateString()

        return (output.format('bibtex'))
      })

      res.status(200)
        .json({
          status: 'success',
          data: {
            citation: output
          },
          message: 'Returned citations.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}


function citationdb(req, res) {

  if (req.params.ids === undefined) {
    req.params.ids = "";
  } else {
    req.params.ids = req.params.ids.split(',')
  }

  query = "MATCH (t:TYPE {type:'schema:DataCatalog'})-[: isType]-(o:OBJECT) \
            WHERE toString(o.id) IN $ids \
            WITH o \
            MATCH (o)-[]-(:ANNOTATION)-[]-(oc:OBJECT)-[:isType]-(:TYPE {type:'schema:CodeRepository'}) \
            OPTIONAL MATCH (oc)-[]-(ag:AGENT)-[]-(at:AGENTTYPE) \
            WHERE at.type IN ['Person', 'Organization'] \
           RETURN COLLECT(ag) AS author, oc.name AS title, toString(oc.id) AS id, oc.url AS url"

  const session = driver.session();
  /* First, try to find the database itself. */

  const aa = session.readTransaction(tx => tx.run(query, {
      ids: req.params.ids
    }))
    .then(result => {
      console.log(result.records)
      output = result.records.map(function(x) {
        records = parsedata(x)
        auths = []
        for (var i = 0; i < records.author.length; i++) {
          auths.append({
            name: records.author[i]
          })
        }
        if (records.author.length == 0) {
          auths = [{
            name: 'n/a'
          }]
        }
        records['author'] = auths;
        apoc
        records['link'] = [{
          url: records['url']
        }];
        records['type'] = 'article';
        records['year'] = 2020;
        if (/.*github\.com.*/.test(records.url)) {
          records['publisher'] = 'GitHub'
          records['journal'] = {
            name: 'GitHub Repository'
          }
        }
        let output = new Cite(records);

        return (output.format('bibtex'))
      })

      res.status(200)
        .json({
          status: 'success',
          data: {
            citation: output
          },
          message: 'Returned citations.'
        })
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(() => session.close())
}


module.exports.citations = citations;
module.exports.citationdb = citationdb;
