const fs = require('fs');
function saveReq(req, res, next){
	fs.appendFile('../log.txt', (new Date()).toString(), function (err) {
		if (err) throw err;
		console.log('Saved!');
	});


	fs.appendFile('../log.txt', req.headers, function (err) {
		if (err) throw err;
		console.log('Saved!');
	});
	fs.appendFile('../log.txt', req.body, function (err) {
                if (err) throw err;
                console.log('Saved!');
        });

	next();
}

module.exports = saveReq;
