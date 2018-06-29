
var express = require('express');
var router = express.Router();
var connection = require('../db');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var verificarToken = require('./verificarToken');

var gm = require('gm').subClass({ imageMagick: true });
var ImageResize = require('node-image-resize');
var fs = require('fs');

/* GET Usuarios listing. */
router.get('/todos', function(req, res, next) {
	connection.query('SELECT idUsuario,nomeUsuario,emailUsuario,dataNascimentoUsuario,admUsuario from Usuario;', function (error, results, fields) {
                if(error){
                        res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});


router.get('/:id/mensagens', verificarToken, function(req, res, next){
	connection.query('SELECT idMensagem,Usuario_idUsuario2 as idUsuario2,mensagem FROM Usuario_Conversa_Usuario WHERE Usuario_idUsuario1='+req.params.id,function(error, results, fields){
		if(error)res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		else res.status(200).send(JSON.stringify({ "status": 200, "error": null, "response": results }));
	});
});


router.get('/:id/avaliacoes', function(req, res, next){
	var consulta="SELECT distinct idTitulo,nomePortuguesTitulo,nomeOriginalTitulo,sinopseTitulo,diretorTitulo,anoProducaoTitulo,duracaoMinutosTitulo,classificacaoTitulo,paisOrigemTitulo,generoTitulo,tipoTitulo,estreiaMundialTitulo,estreiaBrasilTitulo,caminhoFoto FROM Usuario_Avalia_Titulo,Titulo,foto_Titulo WHERE Usuario_Avalia_Titulo.Usuario_idUsuario="+req.params.id+" AND Titulo.idTitulo=Usuario_Avalia_Titulo.Titulo_idTitulo AND Titulo.idTitulo=foto_Titulo.Titulo_idTitulo;"
	connection.query(consulta, function(error, results, fields){
		if(error){
                        res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
	});
});

router.get('/:id/favoritos', function(req, res, next){
	connection.query("SELECT Titulo_idTitulo as idTitulo FROM Usuario_Lista_Titulo WHERE nomeLista='#FAVORITOS#' AND Usuario_idUsuario="+req.params.id, function(error, results, fields){
		if(error)res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null})); 
		else res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
});

//GET Usuario especifico
router.get('/meu', verificarToken, function(req, res, next) {
	console.log(req.headers);
	connection.query('SELECT idUsuario,nomeUsuario,emailUsuario,dataNascimentoUsuario,admUsuario FROM Usuario WHERE idUsuario=?;', [req.idUsuario], 
		function(error, results, fields){
			if(error){
				res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			}else{
				res.status(200).send(JSON.stringify({ "status": 200, "error": null, "response": results }));
			}
		}
	);
});
//GET comentarios de usuarios
router.get('/:id/comentarios', function(req, res, next){
        var consulta = "SELECT idComentario,Usuario_idUsuario AS idUsuario,Titulo_idTitulo AS idTitulo,descricaoComentario AS comentario FROM Usuario_Comenta_Titulo WHERE Usuario_idUsuario="+req.params.id;
        connection.query(consulta+";",function(error, results, fields){
                if(error){
                        res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
                        res.status(200).send(JSON.stringify({ "status": 200, "error": null, "response": results }));
                }
        });
});

//GET listas de um usuario específico
router.get('/:id/listas', verificarToken, function(req, res, next){
	connection.query("SELECT distinct nomeLista FROM Lista WHERE Usuario_idUsuario=?;", req.params.id, function(error, results, fields){
		if(error)
			res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		else
			res.status(200).send(JSON.stringify({ "status": 200, "error": null, "response": results }));
	});
});

//foto perfil
router.post('/fotos', function(req, res) {
	if (!req.files)
		return res.status(400).send(JSON.stringify({ "status": 400, "message": 'Não foi feito upload do arquivo.', "response": null }));

	// The name of the input field (i.e. "sampleFile") is used to retrieve the up$
	var fotoPerfil = req.files.fotoPerfil;
        // Use the mv() method to place the file somewhere on your server
        var caminhoFoto = req.body.idUsuario+'_.'+req.body.formato;
        console.log(caminhoFoto);
        fotoPerfil.mv('./fotosPerfil/'+caminhoFoto, function(err) {
        	if (err){
        		res.status(500).send(JSON.stringify({ "status": 500, "message": "Feito upload, porém ocorreram erros na manipulação do mesmo, tente novamente. Verifique o formato do arquivo.", "response": null }));
                        console.log(err);
                }else{
			gm('./fotosPerfil/'+caminhoFoto).options({imageMagick: true}).resize(240,240).write('./fotosPerfil/'+caminhoFoto, function (err) {
				if (!err) console.log('Done');
				else console.log(err);
			});

			var caminhoFotoInsert = "'"+caminhoFoto;
        		caminhoFotoInsert += "'";
        		var consulta = 'INSERT INTO foto_Usuario (Usuario_idUsuario,caminhoFoto) VALUES ('+req.body.idUsuario+','+caminhoFotoInsert+') ON DUPLICATE KEY UPDATE Usuario_idUsuario='+req.body.idUsuario+',caminhoFoto='+caminhoFotoInsert;
        		connection.query(consulta, function(error, results, fields){
        		        if(error){
        		                res.status(500).send(JSON.stringify({ "status": 500, "message": "Erro ao salvar a foto na pasta. Tente novamente", "response": null }));
        		                console.log(error);
        		        }else
        		                res.status(200).send(JSON.stringify({ "status": 200, "message": 'Upload concluido com sucesso!', "response": null }));
			});


		}
	});
});
//'INSERT INTO foto_Usuario (Usuario_idUsuario,caminhoFoto) VALUES (8,\'8_.png\') ON DUPLICATE KEY UPDATE Usuario_idUsuario=8,\'8_.png\'' }


//DOWNLOAD
router.get('/fotos/:id', function(req, res){
	connection.query('SELECT * FROM foto_Usuario WHERE Usuario_idUsuario=?;',[req.params.id], function(error, results, fields){
		if(error){
			console.log(error);
			res.status(500).send(JSON.stringify({ "status": 500, "message": "Erro ao pesquisar foto do usuário, tente novamente, por favor.", "response": null }));
		}else{
			var file = '/home/ubuntu/OnFleek/fotosPerfil/'+results[0].caminhoFoto;
        		res.sendFile(file);
		}
	});
});

//foto perfil


/* POST Usuarios */
router.post('/cadastro',function(req, res, next) {
	var jsondata = req.body;
	console.log(jsondata.emailUsuario);
	var values = [jsondata.nomeUsuario, jsondata.dataNascimentoUsuario,
		jsondata.emailUsuario, bcrypt.hashSync(jsondata.senhaUsuario), jsondata.admUsuario];

	connection.query('INSERT INTO Usuario (nomeUsuario,dataNascimentoUsuario,emailUsuario,senhaUsuario,admUsuario) VALUES (?) ON DUPLICATE KEY UPDATE admUsuario='+jsondata.admUsuario+';', [values], 
		function (error, results, fields) {
			if(error){
				res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null}));
			} else {
				connection.query('SELECT idUsuario FROM Usuario where emailUsuario=?;', values[2], function(error, results, fields){
					if(error){
						res.status(500).send(JSON.stringify({"status": 500, "error": err, "response": null}));
					}else{
						console.log(results[0]);
						var token = jwt.sign({id: results[0].idUsuario}, config.secret, {
							expiresIn: 86400 //24 horas
						});
//lista favoritos
						var values = [results[0].idUsuario,'#FAVORITOS#'];
        					connection.query("INSERT INTO Lista (Usuario_idUsuario,nomeLista) VALUES (?) ON DUPLICATE KEY UPDATE Usuario_idUsuario="+values[0]+",nomeLista='#FAVORITOS#';",[values],
                					function(error,results,fields){
                        					if(error){
									console.log(error);
                                					res.send(JSON.stringify({ "status": 500, "error": "Erro ao criar favoritos", "response": null }));
                        					}else{
									res.status(200).send(JSON.stringify({ "status": 200,"error": null, "token": token}));
                        					}
					                }
					        );


//lista favoritos 
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
				res.status(500).send(JSON.stringify({"status": 500,"error": error, "response": null}));
			} else if((req.body.tipoUsuario=="admin" && results[0].length!=0 && results[0].admUsuario==1) || (req.body.tipoUsuario=="client")){
				var senhaEhValida = bcrypt.compareSync(values[1], results[0].senhaUsuario);
				if(senhaEhValida){
					var token = jwt.sign({ id: results[0].idUsuario }, config.secret, {
						expiresIn: 86400
					});

					res.status(200).send(JSON.stringify({ "status": 200,"error": null, "token": token }));
				}else{
					res.status(401).send(JSON.stringify({ "status": 401,"error": "Erro ao fazer login, tente novamente.", "token": null }));
				}
			}else res.status(401).send(JSON.stringify({ "status": 401,"error": "Erro, usuario não autorizado.", "token": null }));
		}
	);
});


//ALTERANDO PARA RECEBER AUTENTICACAO
/* PATCH Usuarios */
router.patch('/meu', verificarToken, function(req, res, next){
	var values = [];
	console.log('aqui meu chapa');
	var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+req.idUsuario+" OR emailUsuario='"+[req.body.email];
	consultar += "';";
	var idUsuarioASerAlterado;
	connection.query(consultar, function(error, results, fields){
		if(error){
			res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
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
					res.status(402).send(JSON.stringify({ "status": 402,"auth":false, 
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
	        if(!(typeof req.body.dataNascimentoUsuario === 'undefined')){
	                var valor = req.body.dataNascimentoUsuario+"'";
	                values.push("dataNascimentoUsuario='"+valor);
	        }
		if(!(typeof req.body.admUsuario === 'undefined')){
                        var valor = req.body.admUsuario;
                        values.push("admUsuario="+valor);
                }
		if(!(typeof req.body.emailUsuario === 'undefined')){
                        var valor = req.body.emailUsuario+"'";
                        values.push("emailUsuario='"+valor);
                }

		console.log('alsjdahldakjshdaskjdh');
	        var consulta = "UPDATE Usuario SET "+values.toString()+" WHERE idUsuario="+idUsuarioASerAlterado+";";
	        connection.query("UPDATE Usuario SET "+values.toString()+" WHERE idUsuario="+idUsuarioASerAlterado+";", function(err, results, fields){
	                if(err){
        	                res.status(500).send(JSON.stringify({"status": 500, "error": err, "response": null}));
        	        } else {
        	                res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": "Consulta bem sucedida!"}));
        	        }
       		});
	});
});

/* PATCH /usuarios/meu/senha recebe um token, email,senhaUsuario(antiga),novaSenha,confirmaSenha*/
router.patch('/meu/senha', verificarToken, function(req, res, next){
        var values = [];
        var consultar = 'SELECT * FROM Usuario WHERE idUsuario='+req.idUsuario+" OR emailUsuario='"+[req.body.email];
        consultar += "';";
        var idUsuarioASerAlterado, senhaAntiga;
        connection.query(consultar, function(error, results, fields){
                if(error){
                        res.status(500).send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
                        if(!(typeof results[1] === 'undefined')){
                                var usuarioDoToken;
                                if(results[0].idUsuario===req.idUsuario){
                                        usuarioDoToken = results[0];
                                        idUsuarioASerAlterado = results[1].idUsuario;
					senhaAntiga = results[1].senhaUsuario;
                                }else {
                                        usuarioDoToken = results[1];
                                        idUsuarioASerAlterado = results[0].idUsuario;
					senhaAntiga = results[0].senhaUsuario;
                                }
                                if(usuarioDoToken.admUsuario == "0"){
                                        res.status(402).send(JSON.stringify({ "status": 402,"auth":false, 
                                        "message": 'Não autorizado.' }));
                                }
                        }else {
                                idUsuarioASerAlterado = results[0].idUsuario;
				senhaAntiga = results[0].senhaUsuario;
                        }
                }
                if(typeof(req.body.senhaAtual)=== 'undefined' && typeof(idUsuarioASerAlterado) === 'undefined'){
			console.log('asdasdaasd');
                        return;
                }
		if(bcrypt.compareSync(req.body.senhaAtual, senhaAntiga)){
                        var valor = bcrypt.hashSync(req.body.novaSenha)+"'";
                        values.push("senhaUsuario='"+valor);
			console.log('asdadsadasadasdasdas');
                }

		console.log(values);
                var consulta = "UPDATE Usuario SET "+values.toString()+" WHERE idUsuario="+idUsuarioASerAlterado+";";
                connection.query("UPDATE Usuario SET "+values.toString()+" WHERE idUsuario="+idUsuarioASerAlterado+";", function(err, results, fields){
                        if(err){
                                res.status(500).send(JSON.stringify({"status": 500, "error": err, "response": null}));
                        } else {
                                res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": "Consulta bem sucedida!"}));
                        }
                });
        });
});


//ALTERANDO PARA RECEBER AUTENTICACAO
router.delete('/',verificarToken,function(req, res, next){
	connection.query("SELECT admUsuario FROM Usuario WHERE idUsuario=?;",[req.idUsuario],function(error, results, fields){
		if(error){
			res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null}));
		}else{
			if(results[0].admUsuario===1){
				var consulta = "DELETE FROM Usuario WHERE emailUsuario='"+req.body.emailUsuario;
				consulta += "';";
			        connection.query(consulta, function(error, results, fields){
			                if(error){
			                        res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null}));
			                } else {
			                        res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": "Consulta bem sucedido!"}));
			                }
			        });
			}else{
				res.status(402).send(JSON.stringify({ "status": 402,"auth":false,
                                        "message": 'Não autorizado.' }));
			}
		}
	});
});

module.exports = router;


