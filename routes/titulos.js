var express = require('express');
var router = express.Router();
var mydebug = require('../mydebug');
var verificarToken = require('./verificarToken');
var connection = require('../db');
/* GET titulos listing. */
router.get('/', function(req, res, next) {
	connection.query('SELECT * from Titulo;', function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

router.get('/:id', mydebug, function(req, res, next) {
	if(req.params.id==="generos" || req.params.id==="tipos" || req.params.id==="paises"){
		res.redirect('/titulos/'+req.params.id+'/todos');
		return;
	}
        connection.query('SELECT * FROM Titulo where idTitulo=?;', req.params.id, function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
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

/* POST titulos */
router.post('/', mydebug, verificarToken,function(req, res, next) {
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

				connection.query('INSERT INTO Titulo (nomePortuguesTitulo,nomeOriginalTitulo,sinopseTitulo,diretorTitulo,anoProducaoTitulo,duracaoMinutosTitulo,classificacaoTitulo,paisOrigemTitulo,generoTitulo,tipoTitulo,estreiaMundialTitulo,estreiaBrasilTitulo) VALUES (?);', [values], 
					function (error, results, fields) {
						if(error){
							res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
						} else {
							res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
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
router.patch('/:id', mydebug,verificarToken, function(req, res, next){
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
			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
		}
	});
});

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
        connection.query('SELECT genero from generosTitulo;', function (error, results, fields) {
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
