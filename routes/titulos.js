var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');

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

router.get('/:id', function(req, res, next) {
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
router.get('/:id/comentarios', function(req, res, next){
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
router.post('/',verificarToken,function(req, res, next) {
	connection.query('SELECT admUsuario FROM Usuario WHERE idUsuario=?;',[req.idUsuario],function(error,results,fields){
		if(error){
			console.log("passei por aqui!");
			res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
		}else{
			if(results[0].admUsuario===1){
				var jsondata = req.body;
				var values = [jsondata.nomePortuguesTitulo,jsondata.nomeOriginalTitulo,
					jsondata.sinopseTitulo,jsondata.diretorTitulo,jsondata.anoProducaoTitulo,
					jsondata.duracaoMinutosTitulo,jsondata.classificacaoTitulo,
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
router.patch('/:id',verificarToken, function(req, res, next){
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
                var valor = req.body.anoProducaoTitulo+"'";
                values.push("anoProducaoTitulo='"+valor);
        }
	if(!(typeof req.body.duracaoMinutosTitulo === 'undefined')){
                var valor = req.body.duracaoMinutosTitulo+"'";
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
	var consulta = "UPDATE Titulo SET "+values.toString()+" WHERE idTitulo="+req.params.id+";";

	connection.query(consulta, function(error, results, fields){
		if(error){
			res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
		} else {
			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
		}
	});
});

router.delete('/:id',function(req, res, next){
	var consulta = "DELETE FROM Titulo WHERE idTitulo="+req.params.id+";";

        connection.query(consulta, function(error, results, fields){
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                }
        });

});

module.exports = router;

