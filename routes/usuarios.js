
var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var verificarToken = require('./verificarToken');

/* GET Usuarios listing. */
router.get('/todos', function(req, res, next) {
	connection.query('SELECT idUsuario,nomeUsuario,emailUsuario,dataNascimentoUsuario,admUsuario from Usuario;', function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

//GET Usuario especifico
router.get('/meu', verificarToken, function(req, res, next) {
	console.log(req.headers);
	connection.query('SELECT idUsuario,nomeUsuario,emailUsuario,dataNascimentoUsuario,admUsuario FROM Usuario WHERE idUsuario=?;', [req.idUsuario], 
		function(error, results, fields){
			if(error){
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			}else{
				res.send(JSON.stringify({ "status": 500, "error": null, "response": results }));
			}
		}
	);
});
//GET comentarios de usuarios
router.get('/:id/comentarios', function(req, res, next){
        var consulta = "SELECT idComentario,Usuario_idUsuario AS idUsuario,Titulo_idTitulo AS idTitulo,descricaoComentario AS comentario FROM Usuario_Comenta_Titulo WHERE Usuario_idUsuario="+req.params.id;
        connection.query(consulta+";",function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
                }
        });
});


/* POST Usuarios */
router.post('/cadastro',function(req, res, next) {
	var jsondata = req.body;
	console.log(jsondata.emailUsuario);
	var values = [jsondata.nomeUsuario, jsondata.dataNascimentoUsuario, 
		jsondata.emailUsuario, bcrypt.hashSync(jsondata.senhaUsuario), jsondata.admUsuario];

	connection.query('INSERT INTO Usuario (nomeUsuario,dataNascimentoUsuario,emailUsuario,senhaUsuario,admUsuario) VALUES (?);', [values], 
		function (error, results, fields) {
			if(error){
				res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			} else {
				connection.query('SELECT idUsuario FROM Usuario where senhaUsuario=?;', values[3], function(error, results, fields){
					if(error){
						res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
					}else{
						console.log(results[0]);
						var token = jwt.sign({id: results[0].idUsuario}, config.secret, {
							expiresIn: 86400 //24 horas
						});
						res.send(JSON.stringify({ "status": 200,"auth": true, "token": token}));
					}
				});
			}
		});
});

router.post('/login', function(req, res, next){
	var jsondata = req.body;
	console.log(jsondata.emailUsuario);
	var values = [jsondata.emailUsuario, jsondata.senhaUsuario];

	connection.query('SELECT * from Usuario where emailUsuario=?;',[values[0]],
		function(error, results, fields){
			if(error){
				res.send(JSON.stringify({"status": 500,"error": error, "response": null}));
			} else{
				var senhaEhValida = bcrypt.compareSync(values[1], results[0].senhaUsuario);
				if(senhaEhValida){
					var token = jwt.sign({ id: results[0].idUsuario }, config.secret, {
						expiresIn: 86400
					});

					res.send(JSON.stringify({ "status": 200,"auth": true, "token": token }));
				}else{
					res.send(JSON.stringify({ "status": 401,"auth": false, "token": null }));
				}
			}
		}
	);
});


//ALTERANDO PARA RECEBER AUTENTICACAO
/* PATCH Usuarios */
router.patch('/meu', verificarToken, function(req, res, next){
	var values = [];
	var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+req.idUsuario+" OR emailUsuario='"+[req.body.email];
	consultar += "';";
	var idUsuarioASerAlterado;
	connection.query(consultar, function(error, results, fields){
		if(error){
			res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		}else{
			if(!(typeof results[1] === 'undefined')){
				var usuarioDoToken;
				if(results[0].idUsuario===req.idUsuario){
					usuarioDoToken = results[0];
					idUsuarioASerAlterado = results[1].idUsuario;
				}else {
					usuarioDoToken = results[1];
					idUsuarioASerAlterado = results[0].idUsuario;
				}
				if(usuarioDoToken.admUsuario == "0"){
					res.send(JSON.stringify({ "status": 402,"auth":false, 
                			"message": 'Não autorizado.' }));
				}
			}else {
				idUsuarioASerAlterado = results[0].idUsuario;
			}
		}
		if(typeof(idUsuarioASerAlterado) === 'undefined'){
        	        return;
	        }
	        if(!(typeof req.body.nomeUsuario === 'undefined')){
	                var valor = req.body.nomeUsuario+"'";
	                values.push("nomeUsuario='"+valor);
	        }
	        if(!(typeof req.body.senhaUsuario === 'undefined')){
	                var valor = bcrypt.hashSync(req.body.senhaUsuario)+"'";
	                values.push("senhaUsuario='"+valor);
	        }
	        if(!(typeof req.body.dataNascimentoUsuario === 'undefined')){
	                var valor = req.body.dataNascimentoUsuario+"'";
	                values.push("dataNascimentoUsuario='"+valor);
	        }
		if(!(typeof req.body.admUsuario === 'undefined')){
                        var valor = req.body.admUsuario;
                        values.push("admUsuario="+valor);
                }
		if(!(typeof req.body.emailUsuario === 'undefined')){
                        var valor = req.body.emailUsuario;
                        values.push("emailUsuario="+valor);
                }


	        var consulta = "UPDATE Usuario SET "+values.toString()+" WHERE idUsuario="+idUsuarioASerAlterado+";";
	        connection.query("UPDATE Usuario SET "+values.toString()+" WHERE idUsuario="+idUsuarioASerAlterado+";", function(err, results, fields){
	                if(err){
        	                res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
        	        } else {
        	                res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        	        }
       		});
	});
});
//ALTERANDO PARA RECEBER AUTENTICACAO
router.delete('/',verificarToken,function(req, res, next){
	connection.query("SELECT admUsuario FROM Usuario WHERE idUsuario=?;",[req.idUsuario],function(error, results, fields){
		if(error){
			res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
		}else{
			if(results[0].admUsuario===1){
				var consulta = "DELETE FROM Usuario WHERE emailUsuario='"+req.body.emailUsuario;
				consulta += "';";
			        connection.query(consulta, function(error, results, fields){
			                if(error){
			                        res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			                } else {
			                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
			                }
			        });
			}else{
				res.send(JSON.stringify({ "status": 402,"auth":false,
                                        "message": 'Não autorizado.' }));
			}
		}
	});
});

module.exports = router;


