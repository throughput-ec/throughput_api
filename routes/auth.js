var express = require('express');
var router = express.Router();

var bodyParser = require("body-parser");

router.post('/auth/orcid', function (req, res) {
  var checktoken = require('./../helpers/validate/checkcookie.js')
  checktoken.checktoken(req, res);
})

module.exports = router;
