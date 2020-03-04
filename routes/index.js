var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Annotation API Engine' });
});

router.get('/annotations', function(req, res) {
  var annotation = require('./../helpers/postannotation/postannotation.js');
  annotation.postannotation(req, res);
})

router.get('/ccdr', function(req, res) {
  var ccdr = require('./../helpers/ccdr/ccdr.js');
  console.log(req.query)
  ccdr.searchCcdrs(req, res);
})

router.get('/repo', function(req, res) {
  var ccdr = require('./../helpers/searchRepo/coderepo.js');
  console.log(req.query)
  ccdr.searchRepo(req, res);
})

router.get('/query', function(req, res) {
  var query = require('./../helpers/searchAnnotations/searchNodes.js');
  query.searchNodes(req, res);
})

router.post('/datanote', function(req, res) {
  var notes = require('./../helpers/postannotation/datanote.js');
  notes.datanote(req, res);
})

module.exports = router;
