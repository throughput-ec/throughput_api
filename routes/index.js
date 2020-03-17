var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res)
{
    res.render('index',
    {
        title: 'Annotation API Engine'
    });
});

router.get('/annotations', function (req, res)
{
    var annotation = require('./../helpers/postannotation/postannotation.js');
    annotation.postannotation(req, res);
})

router.get('/ccdr', function (req, res)
{
    var ccdr = require('./../helpers/ccdr/ccdr.js');
    console.log(req.query)
    ccdr.searchCcdrs(req, res);
})

router.get('/metrics/type', function (req, res)
{
    var metrics = require('./../helpers/metrics/metrics.js');
    metrics.nodesByType(req, res);
})

router.get('/metrics/annos', function (req, res)
{
    var metrics = require('./../helpers/metrics/metrics.js');
    metrics.totalAnnot(req, res);
})


router.get('/repo', function (req, res)
{
    var ccdr = require('./../helpers/searchRepo/coderepo.js');
    console.log(req.query)
    ccdr.searchRepo(req, res);
})

router.get('/keyword', function (req, res)
{
    var query = require('./../helpers/keywords/keywords.js');
    query.keywords(req, res);
})

router.post('/datanote', function (req, res)
{
    var notes = require('./../helpers/postannotation/datanote.js');
    notes.datanote(req, res);
})

module.exports = router;