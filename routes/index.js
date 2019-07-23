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

router.get('/query', function(req, res) {
  var query = require('./../helpers/searchAnnotations/searchNodes.js');
  query.searchNodes(req, res);
})

router.post('/datanote', function(req, res) {
  var notes = require('./../helpers/postannotation/datanote.js');
  notes.datanote(req, res);
})

module.exports = router;
