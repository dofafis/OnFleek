var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');

/* GET comentarios listing. */
router.get('/', function(req, res, next) {
        connection.query('SELECT idComentario,Usuario_idUsuario AS idUsuario,Titulo_idTitulo AS idTitulo,descricaoComentario AS comentario from Usuario_Comenta_Titulo;', function (error, results, fields) {
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
        connection.query('SELECT idComentario,Usuario_idUsuario AS idUsuario,Titulo_idTitulo AS idTitulo,descricaoComentario AS comentario from Usuario_Comenta_Titulo where idComentario=?;', req.params.id, function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

// POST comentarios
router.post('/', verificarToken, function(req, res, next){
	connection.query('SELECT * FROM Usuario WHERE idUsuario=?;',[req.idUsuario],
		function(error, results, fields){
			if(error){
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			}else{
				if(results[0].idUsuario===req.body.idUsuario){
					var values = [req.body.idUsuario,req.body.idTitulo,req.body.comentario];
					connection.query('INSERT INTO Usuario_Comenta_Titulo (Usuario_idUsuario,Titulo_idTitulo,descricaoComentario) VALUES (?)',[values],
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
		}
	);
});


/* PATCH Comentarios */
router.patch('/', verificarToken, function(req, res, next){
        var values = [];
        var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+[req.idUsuario];
        consultar += ";";

        connection.query(consultar, function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
			consulta = "SELECT * FROM Usuario_Comenta_Titulo WHERE idComentario="+req.body.idComentario;
			consulta += ";";
			connection.query(consulta, function(error, results, fields){
				if(error){
		                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				}else if(results[0].Usuario_idUsuario===req.idUsuario){
		                	if(!(typeof req.body.comentario === 'undefined')){
	                        		var valor = req.body.comentario+"'";
	                        		values.push("descricaoComentario='"+valor);
	                		}

	                		var consulta = "UPDATE Usuario_Comenta_Titulo SET "+values.toString()+" WHERE idComentario="+req.body.idComentario+";";
	               			connection.query(consulta, function(err, results, fields){
	                	        	if(err){
	                        		        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
	        	                	} else {
		                        	        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
		                        	}
		                	});
				}
			});
		}
        });
});

//ALTERANDO PARA COMENTARIO
router.delete('/:id', verificarToken, function(req, res, next){
        var values = [];
        var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+[req.idUsuario];
        consultar += ";";

        connection.query(consultar, function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
                        consulta = "SELECT * FROM Usuario_Comenta_Titulo WHERE idComentario="+req.params.id;
                        consulta += ";";
                        connection.query(consulta, function(error, results, fields){
                                if(error){
                                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                }else if(results[0].Usuario_idUsuario===req.idUsuario){
                                        var consulta = "DELETE FROM Usuario_Comenta_Titulo WHERE idComentario="+req.params.id+";";
                                        connection.query(consulta, function(err, results, fields){
                                                if(err){
                                                        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                                                } else {
                                                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                                                }
                                        });
                                }
                        });
                }
        });
});



//export
module.exports = router;
