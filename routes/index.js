var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');
var connection = require('../db');
/* GET titulos listing. */
router.get('/', function(req, res, next) {
	res.render({ Onfleek: "Onfleek"});
});

module.exports = router;
