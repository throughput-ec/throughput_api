var express = require('express');
var router = express.Router();

var bodyParser  =  require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

var jsonParser = bodyParser.json()

router.post('/api/widget', function(req, res) {
  console.log('yes!')
  var widget = require('./../helpers/postannotation/datanote.js')
  widget.datanote(req, res)
})

// Search endpoints associated with CCDRs:
router.get('/api/ccdr', function(req, res) {
  var ccdr = require('./../helpers/ccdr/ccdr.js');
  ccdr.searchCcdrs(req, res);
})

// Search endpoints associated with CCDRs:
router.get('/api/ann', function(req, res) {
  var widget = require('./../helpers/postannotation/datanote.js');
  widget.datanote;
})

router.get('/api/ccdr/linked', function(req, res) {
  var ccdr = require('./../helpers/ccdr/ccdr.js');
  ccdr.ccdrLinks(req, res);
})

// Search endpoints associated with CCDRs:
router.get('/api/repo', function(req, res) {
  var ccdr = require('./../helpers/repos/coderepo.js');
  ccdr.searchRepo(req, res);
})

/*
 Summary endpoints:
 Summarizing:
   - node type counts: '/api/summary/types'
   - agent type counts: '/api/summary/agenttypes'
*/
router.get('/api/summary/types', function(req, res) {
  // Number of annotations by OBJECT type.
  var ccdr = require('./../helpers/summary/summary.js');
  ccdr.summaryType(req, res);
})

router.get('/api/summary/typeagent', function(req, res) {
  // Number of annotations by agent type.
  var summary = require('./../helpers/summary/summary.js');
  summary.summaryTypeAgent(req, res);
})

// Keywords
router.get('/api/keywords/all', function(req, res) {
  // Returns all keywords and counts of associated objects.
  var query = require('./../helpers/keywords/keywords.js');
  query.allkeywords(req, res);
})

router.get('/api/keywords/all/ccdrs', function(req, res) {
  // Returns all database keywords and counts of associated objects.
  var query = require('./../helpers/keywords/keywords.js');
  query.ccdrkeywords(req, res);
})

router.get('/api/keyword/all/ccdr', function(req, res) {
  // Returns all database keywords and counts of associated objects.
  var query = require('./../helpers/keywords/keywords.js');
  query.ccdrkeywords(req, res);
})

router.get('/api/keywords/all/repos', function(req, res) {
  // Returns all database keywords and counts of associated objects.
  var query = require('./../helpers/keywords/keywords.js');
  query.repokeywords(req, res);
})

router.get('/api/keywords', function(req, res) {
  var query = require('./../helpers/keywords/keywords.js');
  query.keywords(req, res);
})

router.get('/api/keywords/ccdrs/:ccdr', function(req, res) {
  var query = require('./../helpers/keywords/keywords.js');
  query.keywordsbyccdr(req, res);
})

router.get('/api/keywords/repos/:repo', function(req, res) {
  var query = require('./../helpers/keywords/keywords.js');
  query.keywordsbyrepo(req, res);

})

// Currently removing implementation.  Why did I need this?
//router.get('/api/summary/ccdr', function(req, res) {
//  var ccdr = require('./../helpers/summary/summaryCcdr.js');
//  ccdr.summaryCcdr(req, res);
//})

// Currently removing implementation.  Why did I need this?
//router.get('/api/summary/ccdr/keywords', function(req, res) {
//  var ccdr = require('./../helpers/summary/summaryCcdr.js');
//  ccdr.summaryCcdrkw(req, res);
//})

router.get('/api/metrics/annos', function(req, res) {
  var annotationMetrics = require('./../helpers/metrics/metrics.js');
  annotationMetrics.totalAnnot(req, res);
})

router.get('/api/metrics/annos/users', function(req, res) {
  var metrics = require('./../helpers/metrics/metrics.js');
  metrics.topUsers(req, res);
})

router.get('/api/repos', function(req, res) {
  var ccdr = require('./../helpers/searchRepo/coderepo.js');
  ccdr.searchRepo(req, res);
})

router.get('/api/repos/', function(req, res) {
  var query = require('./../helpers/keywords/keywords.js');
  query.reposbykw(req, res);
})

// router.get('/api/keyword/dbs/linked', function(req, res) {
//   var query = require('./../helpers/keywords/keywords.js');
//   query.dbkeywordmix(req, res);
// })

router.get('/api/citations', function(req, res) {
  var cite = require('./../helpers/citation/citation.js');
  cite.citations(req, res);
})

router.get('/api/db/annotations', function(req, res) {
  var dbanno = require('./../helpers/searchAnnotations/datasetAnnotation.js');
  dbanno.databaseAnnotation(req, res);
})


module.exports = router;
