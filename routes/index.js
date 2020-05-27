var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/api/', function(req, res) {
  res.render('index', {
    title: 'Annotation API Engine'
  });
});

router.get('/api/annotations', function(req, res) {
  var annotation = require('./../helpers/postannotation/postannotation.js');
  annotation.postannotation(req, res);
})

router.get('/api/citations', function(req, res) {
  var citation = require('./../helpers/citation/citation.js');
  citation.citations(req, res);
})

router.get('/api/ccdr', function(req, res) {
  var ccdr = require('./../helpers/ccdr/ccdr.js');
  ccdr.searchCcdrs(req, res);
})

router.get('/api/linked', function(req, res) {
  var ccdr = require('./../helpers/ccdr/ccdr.js');
  ccdr.ccdrLinks(req, res);
})


router.get('/api/summary/types', function(req, res) {
  var ccdr = require('./../helpers/summary/summary.js');
  ccdr.summaryType(req, res);
})

router.get('/api/summary/ccdr', function(req, res) {
  var ccdr = require('./../helpers/summary/summaryCcdr.js');
  ccdr.summaryCcdr(req, res);
})

router.get('/api/summary/ccdr/keywords', function(req, res) {
  var ccdr = require('./../helpers/summary/summaryCcdr.js');
  ccdr.summaryCcdrkw(req, res);
})

router.get('/api/metrics/type', function(req, res) {
  var metrics = require('./../helpers/metrics/metrics.js');
  metrics.nodesByType(req, res);
})

router.get('/api/metrics/annos', function(req, res) {
  var metrics = require('./../helpers/metrics/metrics.js');
  metrics.totalAnnot(req, res);
})

router.get('/api/metrics/annos/users', function(req, res) {
  var metrics = require('./../helpers/metrics/metrics.js');
  metrics.topUsers(req, res);
})

router.get('/api/repo', function(req, res) {
  var ccdr = require('./../helpers/searchRepo/coderepo.js');
  ccdr.searchRepo(req, res);
})

router.get('/api/keyword', function(req, res) {
  var query = require('./../helpers/keywords/keywords.js');
  query.keywords(req, res);
})

router.get('/api/keyword/all', function(req, res) {
  var query = require('./../helpers/keywords/keywords.js');
  query.allkeywords(req, res);
})

router.get('/api/keyword/dbs/count', function(req, res) {
  var query = require('./../helpers/keywords/keywords.js');
  query.countDBbykw(req, res);
})


router.get('/api/keyword/repos', function(req, res) {
  var query = require('./../helpers/keywords/keywords.js');
  query.reposbykw(req, res);
})

router.post('/api/datanote', function(req, res) {
  var notes = require('./../helpers/postannotation/datanote.js');
  notes.datanote(req, res);
})

module.exports = router;
