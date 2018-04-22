var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');


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

router.get('/', function(req, res, next) {
	var token = req.headers['access-token'];
	if(!token){
		return res.status(401).send({
			auth: false,
			message: 'Token não fornecido'
		});
	}
        jwt.verify(token, config.secret, function(err, decoded){
		if(err){
			return res.status(500).send({auth: false, message: 'Erro na autentiacação do token'});
		}
		//res.status(200).send(decoded);
		connection.query('SELECT idUsuario,nomeUsuario,emailUsuario from Usuario where idUsuario=?;', [decoded.id], function (error, results, fields) {
                	if(error){
                	        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                	        //If there is error, we send the error in the error section with 500 status
                	}else {
                	        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                	        //If there is no error, all is good and response is 200OK.
        	        }
	        });

	});
});

/* POST Usuarios */
router.post('/',function(req, res, next) {
	var jsondata = req.body;
	console.log(jsondata.senhaUsuario);
	var values = [jsondata.nomeUsuario, jsondata.emailUsuario, bcrypt.hashSync(jsondata.senhaUsuario)];

	//values.senhaUsuario = bcrypt.hashSync(req.body.senhaUsuario, 8);

	connection.query('INSERT INTO Usuario (nomeUsuario,emailUsuario,senhaUsuario) VALUES (?);', [values], 
		function (error, results, fields) {
			if(error){
				res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			} else {
				connection.query('SELECT idUsuario FROM Usuario where senhaUsuario=?;', values[2], function(err, rows, fields){
					if(err){
						res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
					}else{
						console.log(rows[0]);
						var token = jwt.sign({id: rows[0].idUsuario}, config.secret, {
							expiresIn: 86400 //24 horas
						});
						res.status(200).send({auth: true, token: token});
					}
				});
			}
		});
});

//CONTINUA
router.post('/login', function(){

});
//CONTINUA

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

