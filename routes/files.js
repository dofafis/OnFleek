var express = require('express');
var router = express.Router();
var connection = require('../db');

router.post('/uploads', function(req, res) {
        console.log('cheguei aqui');
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var sampleFile = req.files.sampleFile;
        console.log(req.body.fileName);
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./uploads/'+req.body.fileName, function(err) {
    if (err)
      return res.status(500).send(err);
 
    res.send('File uploaded!');
  });
});

router.get('/downloads', function(req, res){
	//console.log(req);
	var file = './uploads/'+req.headers.filename;
	res.download(file);
});

module.exports = router;
