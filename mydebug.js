function mydebug(req, res, next){
	console.log("oqtaconteseno...");
	next();
}

module.exports = mydebug;


