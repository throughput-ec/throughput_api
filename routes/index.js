var express = require('express');
var router = express.Router();

var bodyParser  =  require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

var jsonParser = bodyParser.json()

// KEYWORDS
// Keywords from keyword searches, or all keywords (with counts)
router.get('/api/keywords', function(req, res) {
  // Returns all keywords and counts of associated objects.
  console.log('yes')
  var query = require('./../helpers/keywords/keywords.js');
  query.allkeywords(req, res);
})

// Get keywords associated with specific code repositories (in post body)
router.get('/api/ccdrs/keywords', function(req, res) {
  var ccdr = require('./../helpers/keywords/keywordccdr.js');
  ccdr.keywordccdr(req, res);
})

// Get keywords associated with code repositories
router.get('/api/repos/keywords', function(req, res) {
  var ccdr = require('./../helpers/keywords/keywordrepo.js');
  ccdr.keywordrepo(req, res);
})

// DATABASES
// Databases by keywords.
router.get('/api/keywords/ccdrs', function(req, res) {
  // Returns all keywords and counts of associated objects.
  var query = require('./../helpers/ccdr/ccdr.js');
  query.searchCCDR(req, res);
})

// Repositories by keywords.
router.get('/api/keywords/repos', function(req, res) {
  // Returns all keywords and counts of associated objects.
  var query = require('./../helpers/repos/coderepo.js');
  query.searchRepo(req, res);
})


router.get('/api/ccdrs/repos', function(req, res) {
  // Returns all keywords and counts of associated objects.
  var query = require('./../helpers/repos/repoFromCcdr.js');
  query.repoFromCcdr(req, res);
})


// Search endpoints associated with repositories:
router.get('/api/repos', function(req, res) {
  var ccdr = require('./../helpers/repos/coderepo.js');
  ccdr.searchRepo(req, res);
})

// Search endpoints associated with CCDRs:
router.get('/api/ccdr', function(req, res) {
  var ccdr = require('./../helpers/ccdr/ccdr.js');
  ccdr.searchCcdrs(req, res);
})

router.post('/api/widget', function(req, res) {
  console.log('yes!')
  var widget = require('./../helpers/postannotation/datanote.js')
  widget.datanote(req, res)
})

router.get('/api/ccdr/linked', function(req, res) {
  var ccdr = require('./../helpers/ccdr/ccdr.js');
  ccdr.ccdrLinks(req, res);
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

router.get('/api/citations', function(req, res) {
  var cite = require('./../helpers/citation/citation.js');
  cite.citations(req, res);
})

router.get('/api/ccdrs/annotations', function(req, res) {
  var dbanno = require('./../helpers/searchAnnotations/datasetAnnotation.js');
  dbanno.databaseAnnotation(req, res);
})

router.post('/api/ccdrs/annotations', function(req, res) {
  var dbanno = require('./../helpers/searchAnnotations/datasetAnnotation.js');
  dbanno.databaseAnnotation(req, res);
})

module.exports = router;
