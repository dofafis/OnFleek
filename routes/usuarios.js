var express = require('express');
var router = express.Router();

/* GET Usuarios listing. */
router.get('/todos', function(req, res, next) {
	connection.query('SELECT * from Usuario', function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

router.get('/:id', function(req, res, next) {
        connection.query('SELECT * from Usuario where idUsuario=?;', req.params.id, function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

/* POST Usuarios */
router.post('/',function(req, res, next) {
	var jsondata = req.body;
	var values = [jsondata.nomeUsuario, jsondata.emailUsuario, jsondata.senhaUsuario];

	connection.query('INSERT INTO Usuario (nomeUsuario,emailUsuario,senhaUsuario) VALUES (?);', [values], 
		function (error, results, fields) {
			if(error){
				res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			} else {
				res.send(JSON.stringify({"status": 200, "error": error, "response": null}));
			}
		});
});

/* PATCH Usuarios */
router.patch('/:id', function(req, res, next){
	var values = [];
	if(!(typeof req.body.nomeUsuario === 'undefined')){
		var valor = req.body.nomeUsuario+"'";
		values.push("nomeUsuario='"+valor);
	}
	if(!(typeof req.body.emailUsuario === 'undefined')){
		var valor = req.body.emailUsuario+"'";
                values.push("emailUsuario='"+valor);
        }
	if(!(typeof req.body.senhaUsuario === 'undefined')){
		var valor = req.body.senhaUsuario+"'";
                values.push("senhaUsuario='"+valor);
        }
	console.log(values.toString());
	var consulta = "UPDATE Usuario SET "+values.toString()+" WHERE idUsuario="+req.params.id+";";

	connection.query(consulta, function(error, results, fields){
		if(error){
			res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
		} else {
			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
		}
	});
});

router.delete('/:id',function(req, res, next){
	var consulta = "DELETE FROM Usuario WHERE idUsuario="+req.params.id+";";

        connection.query(consulta, function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                }
        });

});

module.exports = router;

