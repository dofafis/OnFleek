/*
ROTAS:
 - GET /listas/:idusuario retorna todos os nomes de lista do usuario
 - GET /listas/:usuario/:nomelista recebe o nome da lista no parametro, o usuario dono da lista e o token para verificar se que é um usuario cadastrado tentando
	ver as listas
 - POST /listas cria lista, envia usuario,titulo e nome da lista e coloca no banco, recebe também um token para verificar que é um usuario do sistema
 - PATCH /listas/:nome/add recebe nome de uma lista no parâmetro e token do usuario
*/


var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');
var connection = require('../db');
/* GET listas listing. */
router.get('/:usuario/todos', function(req, res, next) {
        connection.query('SELECT nomeLista from Usuario_Lista_Titulo where Usuario_idUsuario=?;', [req.params.usuario], function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

router.get('/:usuario/:nomelista', function(req, res, next) {
        connection.query('SELECT Titulo_idTitulo as idTitulo from Usuario_Lista_Titulo where Usuario_idUsuario=? AND nomeLista=?;', [req.params.usuario], [req.params.nomelista], function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});


// POST listas
router.post('/', verificarToken, function(req, res, next){
	connection.query('SELECT * FROM Usuario WHERE idUsuario=?;',[req.idUsuario],
		function(error, results, fields){
			if(error){
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			}else{
				var values = [req.body.idUsuario,req.body.idTitulo,req.body.nomeLista];
				connection.query('INSERT INTO Usuario_Lista_Titulo (Usuario_idUsuario,Titulo_idTitulo,nomeLista) VALUES (?)',[values],
					function(error,results,fields){
						if(error){
        			                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
       	                			}else{
							res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
						}
					}
				);
			}
		}
	);
});


/* PATCH listas */
router.patch('/', verificarToken, function(req, res, next){
        var values = [];
        var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+[req.idUsuario];
        consultar += ";";

        connection.query(consultar, function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
			consulta = "SELECT * FROM Usuario_Lista_Titulo WHERE idComentario="+req.body.idComentario;
			consulta += ";";
			connection.query(consulta, function(error, results, fields){
				if(error){
		                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				}else if(results[0].Usuario_idUsuario===req.idUsuario){
		                	if(!(typeof req.body.comentario === 'undefined')){
	                        		var valor = req.body.comentario+"'";
	                        		values.push("nomeLista='"+valor);
						var consulta = "UPDATE Usuario_Lista_Titulo SET "+values.toString()+" WHERE idComentario="+req.body.idComentario+";";
                                        	connection.query(consulta, function(err, results, fields){
                                                	if(err){
                                                	        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                                                	} else {
                                                	        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                                                	}
                                        	});
	                		}else{
						res.send(JSON.stringify({ "status": 204 , "message": "Comentário editado não foi enviado no corpo da requisição" }));
					}

				}else{
					res.send(JSON.stringify({ "status": 401, "auth": false, "message": "Usuario não autorizado a executar esta ação" }));
				}
			});
		}
        });
});

//ALTERANDO PARA COMENTARIO
router.delete('/', verificarToken, function(req, res, next){
        var values = [];
        var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+[req.idUsuario];
        consultar += ";";

        connection.query(consultar, function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
			var usuarioToken = results[0];
                        consulta = "SELECT * FROM Usuario_Lista_Titulo WHERE idComentario="+req.body.idComentario;
                        consulta += ";";
                        connection.query(consulta, function(error, results, fields){
                                if(error){
                                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                }else if(results[0].Usuario_idUsuario===req.idUsuario || usuarioToken.admUsuario===1){
                                        var consulta = "DELETE FROM Usuario_Lista_Titulo WHERE idComentario="+req.body.idComentario+";";
                                        connection.query(consulta, function(err, results, fields){
                                                if(err){
                                                        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                                                } else {
                                                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                                                }
                                        });
                                }else if(usuarioToken.admUsuario===0){
					res.send(JSON.stringify({ "status": 401, "auth": false, "message": "Usuario não autorizado a executar esta ação" }));
				}
                        });
                }
        });
});



//export
module.exports = router;
