var express = require('express');
var router = express.Router();
var mydebug = require('../mydebug');
var verificarToken = require('./verificarToken');
var connection = require('../db');

var gm = require('gm').subClass({ imageMagick: true });
var ImageResize = require('node-image-resize');
var fs = require('fs');

/* GET titulos listing. */
router.get('/', function(req, res, next) {
	connection.query('SELECT * from Titulo;', function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
			for(var i=0;i<results.length;i++){
				results[i].estreiaMundialTitulo = JSON.stringify(results[i].estreiaMundialTitulo).substring(1,12)+"04:00:00.000Z";
				results[i].estreiaBrasilTitulo = JSON.stringify(results[i].estreiaBrasilTitulo).substring(1,12)+"04:00:00.000Z";
			}
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

router.get('/:idgenero/porgenero', function(req, res, next) {
        connection.query('SELECT * from generosTitulo where idGenero='+req.params.idgenero+';', function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
			var consulta = "SELECT * FROM Titulo where generoTitulo='";
			consulta += results[0].genero+"';"; 
			connection.query(consulta, function(error, results, fields){
				if(error)res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
	                        else{
					res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        		//If there is no error, all is good and response is 200OK.
				}
			});
                }
        });
});


router.get('/:id', mydebug, function(req, res, next) {
	if(req.params.id==="generos" || req.params.id==="tipos" || req.params.id==="paises"){
		res.redirect('/titulos/'+req.params.id+'/todos');
		return;
	}
        connection.query('SELECT * FROM Titulo,foto_Titulo where Titulo.idTitulo=? AND Titulo.idTitulo=foto_Titulo.Titulo_idTitulo;', req.params.id, function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
			if(results.length!=0)res.send(JSON.stringify({"status": 500, "error": null, "response": results})); 
			else{
				connection.query('SELECT * FROM Titulo where idTitulo=?;',req.params.id,function(error, results, fields){
					if(error){
						res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
					}else{
						results[0].caminhoFoto = null;
			                      	res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        		               	 	//If there is no error, all is good and response is 200OK.
					}
				});
			}
                }
        });
});


router.get('/:id/comentarios', mydebug, function(req, res, next){
	var consulta = "SELECT idComentario,Usuario_idUsuario AS idUsuario,Titulo_idTitulo AS idTitulo,descricaoComentario AS comentario FROM Usuario_Comenta_Titulo WHERE Titulo_idTitulo="+req.params.id;
	connection.query(consulta+";",function(error, results, fields){
		if(error){
			res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		}else{
			res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
		}
	});
});

//GET listas em que o titulo esta
router.get('/:id/listas', function(req, res, next){
	connection.query('SELECT * FROM Usuario_Lista_Titulo WHERE Titulo_idTitulo=?;', req.params.id, function(error, results, fields){
		if(error){
			res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		}else{
			res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
		}
	});
});

router.get('/:idtitulo/imagem', function(req, res, next){
        connection.query('SELECT * FROM foto_Titulo WHERE Titulo_idTitulo=?;', [req.params.idtitulo], function(error, results, fields){
                if(error){
                        console.log(error);
                        res.send(JSON.stringify({ "status": 500, "message": "Erro ao pesquisar cartao1.", "response": null }));
                }else{
                        if(results.length === 0)res.send(JSON.stringify({ "status": 500, "message": "Inexistente", "response": 0 }));
                        else{
                                res.sendFile("/home/ubuntu/OnFleek/titulosImagem/"+results[0].caminhoFoto);
                        }
                }
        });
});

/* POST titulos */
//foto perfil
router.post('/fotos', function(req, res) {
        if (!req.files)
                return res.send(JSON.stringify({ "status": 400, "message": 'Não foi feito upload do arquivo.', "response": null }));

        // The name of the input field (i.e. "sampleFile") is used to retrieve the up$
        var tituloImagem = req.files.tituloImagem;
	var formatoImagem = req.files.tituloImagem.name;
        // Use the mv() method to place the file somewhere on your server
	formatoImagem = formatoImagem.split('.');
        formatoImagem = formatoImagem[formatoImagem.length-1];

        var caminhoFoto = req.body.idTitulo+'_.'+formatoImagem;
        console.log(caminhoFoto);
        tituloImagem.mv('./titulosImagem/'+caminhoFoto, function(err) {
                if (err){
                        res.send(JSON.stringify({ "status": 500, "message": "Feito upload, porém ocorreram erros na manipulação do mesmo, tente novamente. Verifique o formato do arquivo.", "response": null }));
                        console.log(err);
                }else{
                        gm('./titulosImagem/'+caminhoFoto).options({imageMagick: true}).resize(240,240).write('./tituloImagem/'+caminhoFoto, function (err) {
                                if (!err) console.log('Done');
                                else console.log(err);
                        });

                        var caminhoFotoInsert = "'"+caminhoFoto;
                        caminhoFotoInsert += "'";
                        var consulta = 'INSERT INTO foto_Titulo (Titulo_idTitulo,caminhoFoto) VALUES ('+req.body.idTitulo+','+caminhoFotoInsert+') ON DUPLICATE KEY UPDATE Titulo_idTitulo='+req.body.idTitulo+',caminhoFoto='+caminhoFotoInsert+' ';
                        connection.query(consulta, function(error, results, fields){
                                if(error){
                                        res.send(JSON.stringify({ "status": 500, "message": "Erro ao salvar a foto na pasta. Tente novamente", "response": null }));
                                        console.log(error);
                                }else
                                        res.send(JSON.stringify({ "status": 200, "message": 'Upload concluido com sucesso!', "response": null }));
                        });


                }
        });
});
//'INSERT INTO foto_Usuario (Usuario_idUsuario,caminhoFoto) VALUES (8,\'8_.png\') ON DUPLICATE KEY UPDATE Usuario_idUsuario=8,\'8_.png\'' }

//GENEROS
router.get('/:idgenero/imagemgenero', function(req, res, next){
        connection.query('SELECT * FROM foto_Genero WHERE Genero_idGenero=?;', [req.params.idgenero], function(error, results, fields){
                if(error){
                        console.log(error);
                        res.send(JSON.stringify({ "status": 500, "message": "Erro ao pesquisar cartao1.", "response": null }));
                }else{
                        if(results.length === 0)res.send(JSON.stringify({ "status": 500, "message": "Inexistente", "response": 0 }));
                        else{
                                res.sendFile("/home/ubuntu/OnFleek/generosImagem/"+results[0].caminhoFoto);
                        }
                }
        });
});

router.post('/fotosgenero', function(req, res) {
        if (!req.files)
                return res.send(JSON.stringify({ "status": 400, "message": 'Não foi feito upload do arquivo.', "response": null }));

        // The name of the input field (i.e. "sampleFile") is used to retrieve the up$
        var generoImagem = req.files.generoImagem;
        var formatoImagem = req.files.generoImagem.name;
        // Use the mv() method to place the file somewhere on your server
        formatoImagem = formatoImagem.split('.');
        formatoImagem = formatoImagem[formatoImagem.length-1];

        var caminhoFoto = req.body.idGenero+'_.'+formatoImagem;
        console.log(caminhoFoto);
        generoImagem.mv('./generosImagem/'+caminhoFoto, function(err) {
                if (err){
                        res.send(JSON.stringify({ "status": 500, "message": "Feito upload, porém ocorreram erros na manipulação do mesmo, tente novamente. Verifique o formato do arquivo.", "response": null }));
                        console.log(err);
                }else{
                        gm('./generosImagem/'+caminhoFoto).options({imageMagick: true}).resize(240,240).write('./generoImagem/'+caminhoFoto, function (err) {
                                if (!err) console.log('Done');
                                else console.log(err);
                        });

                        var caminhoFotoInsert = "'"+caminhoFoto;
                        caminhoFotoInsert += "'";
                        var consulta = 'INSERT INTO foto_Genero (Genero_idGenero,caminhoFoto) VALUES ('+req.body.idGenero+','+caminhoFotoInsert+') ON DUPLICATE KEY UPDATE Genero_idGenero='+req.body.idGenero+',caminhoFoto='+caminhoFotoInsert+' ';
                        connection.query(consulta, function(error, results, fields){
                                if(error){
                                        res.send(JSON.stringify({ "status": 500, "message": "Erro ao salvar a foto na pasta. Tente novamente", "response": null }));
                                        console.log(error);
                                }else
                                        res.send(JSON.stringify({ "status": 200, "message": 'Upload concluido com sucesso!', "response": null }));
                        });


                }
        });
});

//GENEROS

router.post('/', mydebug, verificarToken,function(req, res, next) {
	console.log("cheguei aqui");
	connection.query('SELECT admUsuario,emailUsuario FROM Usuario WHERE idUsuario=?;',[req.idUsuario],function(error,results,fields){
		if(error){
			console.log("passei por aqui!");
			res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
		}else{
			if(results[0].admUsuario===1){
				console.log(results[0].emailUsuario);
				//console.log(req.headers);
				//console.log(req.body);
				var jsondata = req.body;
				var values = [jsondata.nomePortuguesTitulo,jsondata.nomeOriginalTitulo,
					jsondata.sinopseTitulo,jsondata.diretorTitulo,parseInt(jsondata.anoProducaoTitulo),
					parseInt(jsondata.duracaoMinutosTitulo),jsondata.classificacaoTitulo,
					jsondata.paisOrigemTitulo,jsondata.generoTitulo,jsondata.tipoTitulo,
					jsondata.estreiaMundialTitulo,jsondata.estreiaBrasilTitulo];

				connection.query('INSERT INTO Titulo (nomePortuguesTitulo,nomeOriginalTitulo,sinopseTitulo,diretorTitulo,anoProducaoTitulo,duracaoMinutosTitulo,classificacaoTitulo,paisOrigemTitulo,generoTitulo,tipoTitulo,estreiaMundialTitulo,estreiaBrasilTitulo) VALUES (?) ON DUPLICATE KEY UPDATE duracaoMinutosTitulo='+jsondata.duracaoMinutosTitulo+';' , [values], 
					function (error, results, fields) {
						if(error){
							res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
						} else {
							res.send(JSON.stringify({"status": 200, "error": null, "response": results.insertId}));
						}
				});
			}else{
                                res.send(JSON({ "status": 402,"auth": false,
                                        "message": 'Não autorizado.' }));
                        }
		}
	});
});

/* PATCH títulos */
router.patch('/:id', verificarToken, function(req, res, next){
	var jsondata = req.body;
	var values = [];
	if(!(typeof req.body.nomePortuguesTitulo === 'undefined')){
		var valor = req.body.nomePortuguesTitulo+"'";
		values.push("nomePortuguesTitulo='"+valor);
	}
	if(!(typeof req.body.nomeOriginalTitulo === 'undefined')){
                var valor = req.body.nomeOriginalTitulo+"'";
                values.push("nomeOriginalTitulo='"+valor);
        }
	if(!(typeof req.body.sinopseTitulo === 'undefined')){
                var valor = req.body.sinopseTitulo+"'";
                values.push("sinopseTitulo='"+valor);
        }
	if(!(typeof req.body.diretorTitulo === 'undefined')){
                var valor = req.body.diretorTitulo+"'";
                values.push("diretorTitulo='"+valor);
        }
	if(!(typeof req.body.anoProducaoTitulo === 'undefined')){
                var valor = parseInt(req.body.anoProducaoTitulo)+"'";
                values.push("anoProducaoTitulo='"+valor);
        }
	if(!(typeof req.body.duracaoMinutosTitulo === 'undefined')){
                var valor = parseInt(req.body.duracaoMinutosTitulo)+"'";
                values.push("duracaoMinutosTitulo='"+valor);
        }
	if(!(typeof req.body.classificacaoTitulo === 'undefined')){
                var valor = req.body.classificacaoTitulo+"'";
                values.push("classificacaoTitulo='"+valor);
        }
	if(!(typeof req.body.paisOrigemTitulo === 'undefined')){
                var valor = req.body.paisOrigemTitulo+"'";
                values.push("paisOrigemTitulo='"+valor);
        }
	if(!(typeof req.body.generoTitulo === 'undefined')){
                var valor = req.body.generoTitulo+"'";
                values.push("generoTitulo='"+valor);
        }
	if(!(typeof req.body.tipoTitulo === 'undefined')){
                var valor = req.body.tipoTitulo+"'";
                values.push("tipoTitulo='"+valor);
        }
	if(!(typeof req.body.estreiaMundialTitulo === 'undefined')){
                var valor = req.body.estreiaMundialTitulo+"'";
                values.push("estreiaMundialTitulo='"+valor);
        }
	if(!(typeof req.body.estreiaBrasilTitulo === 'undefined')){
                var valor = req.body.estreiaBrasilTitulo+"'";
                values.push("estreiaBrasilTitulo='"+valor);
        }

	console.log(values.toString());
	var consulta = "UPDATE Titulo SET "+values.toString()+" WHERE idTitulo="+parseInt(req.params.id)+";";

	connection.query(consulta, function(error, results, fields){
		if(error){
			res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
		} else {
			res.send(JSON.stringify({"status": 200, "error": null, "response": "Consulta bem sucedida!"}));
		}
	});
});


//ADICIONAR VERIFICAÇÃO DE TOKEN
router.delete('/:id', mydebug,function(req, res, next){
	var consulta = "DELETE FROM Titulo WHERE idTitulo="+parseInt(req.params.id)+";";

        connection.query(consulta, function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                }
        });

});


router.get('/generos/todos', function(req, res, next) {
        connection.query('SELECT * from generosTitulo;', function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

router.get('/tipos/todos', function(req, res, next) {
        connection.query('SELECT tipo from tiposTitulo;', function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

router.get('/paises/todos', function(req, res, next) {
        connection.query('SELECT pais from paisesTitulo;', function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

module.exports = router;
