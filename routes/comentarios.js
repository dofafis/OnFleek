var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');
var connection = require('../db');
/* GET /comentarios  retorna todos os comentários. */
router.get('/', function(req, res, next) {
        connection.query('SELECT idComentario,Usuario_idUsuario AS idUsuario,Titulo_idTitulo AS idTitulo,descricaoComentario AS comentario from Usuario_Comenta_Titulo;', function (error, results, fields) {
                if(error){
                        res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

/* GET /comentarios/:id recebe o id do comentário no parametro e retorna as informações do comentário em questão */
router.get('/:id', function(req, res, next) {
        connection.query('SELECT idComentario,Usuario_idUsuario AS idUsuario,Titulo_idTitulo AS idTitulo,descricaoComentario AS comentario from Usuario_Comenta_Titulo where idComentario=?;', req.params.id, function (error, results, fields) {
                if(error){
                        res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

/* POST /comentarios recebe um token, 'idUsuario','idTitulo','comentario' */
router.post('/', verificarToken, function(req, res, next){
	connection.query('SELECT * FROM Usuario WHERE idUsuario=?;',[req.idUsuario],
		function(error, results, fields){
			if(error){
				res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			}else{
				if(results[0].idUsuario===req.body.idUsuario){
					var values = [req.body.idUsuario,req.body.idTitulo,req.body.comentario];
					connection.query('INSERT INTO Usuario_Comenta_Titulo (Usuario_idUsuario,Titulo_idTitulo,descricaoComentario) VALUES (?)',[values],
						function(error,results,fields){
							if(error){
	        			                        res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
        	                			}else{
								res.status(200).send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
							}
						}
					);
				}
			}
		}
	);
});


/* PATCH /comentarios recebe um token e o novo comentário editado no atributo 'comentario' */
router.patch('/', verificarToken, function(req, res, next){
        var values = [];
        var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+[req.idUsuario];
        consultar += ";";

        connection.query(consultar, function(error, results, fields){
                if(error){
                        res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
			consulta = "SELECT * FROM Usuario_Comenta_Titulo WHERE idComentario="+req.body.idComentario;
			consulta += ";";
			connection.query(consulta, function(error, results, fields){
				if(error){
		                        res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				}else if(results[0].Usuario_idUsuario===req.idUsuario){
		                	if(!(typeof req.body.comentario === 'undefined')){
	                        		var valor = req.body.comentario+"'";
	                        		values.push("descricaoComentario='"+valor);
						var consulta = "UPDATE Usuario_Comenta_Titulo SET "+values.toString()+" WHERE idComentario="+req.body.idComentario+";";
                                        	connection.query(consulta, function(err, results, fields){
                                                	if(err){
                                                	        res.status(500).send(JSON.stringify({"status": 500, "error": err, "response": null}));
                                                	} else {
                                                	        res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": "Consulta bem sucedida!"}));
                                                	}
                                        	});
	                		}else{
						res.status(204).send(JSON.stringify({ "status": 204 , "message": "Comentário editado não foi enviado no corpo da requisição" }));
					}

				}else{
					res.status(401).send(JSON.stringify({ "status": 401, "auth": false, "message": "Usuario não autorizado a executar esta ação" }));
				}
			});
		}
        });
});

/* DELETE /comentarios recebe um token e o idComentario que deseja deletar */
router.delete('/', verificarToken, function(req, res, next){
        var values = [];
        var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+[req.idUsuario];
        consultar += ";";

        connection.query(consultar, function(error, results, fields){
                if(error){
                        res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
			var usuarioToken = results[0];
                        consulta = "SELECT * FROM Usuario_Comenta_Titulo WHERE idComentario="+req.body.idComentario;
                        consulta += ";";
                        connection.query(consulta, function(error, results, fields){
                                if(error){
                                        res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                }else if(results.length!=0 && (results[0].Usuario_idUsuario===req.idUsuario || usuarioToken.admUsuario===1)){
                                        var consulta = "DELETE FROM Usuario_Comenta_Titulo WHERE idComentario="+req.body.idComentario+";";
                                        connection.query(consulta, function(err, results, fields){
                                                if(err){
                                                        res.status(500).send(JSON.stringify({"status": 500, "error": err, "response": null}));
                                                } else {
                                                        res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": "Consulta bem sucedida!"}));
                                                }
                                        });
                                }else if(results.length!=0 && usuarioToken.admUsuario===0){
					res.status(401).send(JSON.stringify({ "status": 401, "auth": false, "message": "Usuario não autorizado a executar esta ação" }));
				}else res.status(500).send(JSON.stringify({ "status": 500, "error": "Comentário inexistente, talvez você tenha tentado deletá-lo duas vezes", "response": null }));
                        });
                }
        });
});



//export
module.exports = router;
