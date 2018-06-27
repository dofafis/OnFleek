/*
ROTAS:
*/
"$what$ever$".split("$").join("\\$")
var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');
var connection = require('../db');
/* GET listas listing. Recebe idusuario nos headers e o nomelista no 
parâmetro e retorna os ids dos títulos que estão na respectiva lista*/
router.get('/nomelista', function(req, res, next) {
	var consulta = 'SELECT Titulo_idTitulo from Usuario_Lista_Titulo where Usuario_idUsuario='+req.body.idusuario+" AND nomeLista='";
	consulta+=req.body.nomelista+"';";
	console.log(consulta);
	connection.query(consulta, function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});
//Mesma coisa que a rota /:nomelista, porém aqui ele só retorna verdadeiro ou falso se existir ou não uma lista desse usuário com esse nome
router.get('/existelista', function(req, res, next) {
	var consulta = 'SELECT distinct Titulo_idTitulo from Usuario_Lista_Titulo where Usuario_idUsuario='+req.body.idusuario+" AND nomeLista='";
	consulta+=req.body.nomelista+"';";
        connection.query(consulta, function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": (results.length>0) }));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});


/*//ROTA DE AVALIAÇÕES, DECIDINDO COMO VAI SER AINDA
router.get('/avaliacoes/:estrelas', function(req, res, next){
	connection.query('', function(error, results, fields){

	});
});
*/
/* POST listas Recebe um token do usuario que está criando a lista, também recebe o nome da lista e se quiser criar uma lista vazia, envia um idTitulo igual a zero*/
router.post('/', verificarToken, function(req, res, next){
	connection.query('SELECT distinct * FROM Usuario_Lista_Titulo WHERE Usuario_idUsuario=?;',[req.idUsuario],
		function(error, results, fields){
			if(error){
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			}else{
				var values = [req.idUsuario,req.body.idTitulo,req.body.nomeLista];
				connection.query('INSERT INTO Usuario_Lista_Titulo (Usuario_idUsuario,Titulo_idTitulo,nomeLista) VALUES (?) ON DUPLICATE KEY UPDATE Usuario_idUsuario='+req.idUsuario+',Titulo_idTitulo='+req.body.idTitulo+',nomeLista='+JSON.stringify(req.body.nomeLista),[values],
					function(error,results,fields){
						if(error){
        			                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
       	                			}else{
							res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
						}
					}
				);
			}
		}
	);
});

router.patch('/', verificarToken, function(req, res, next){
	var values = [req.body.nomeLista, req.body.novoNome];
	var consulta = "update Usuario_Lista_Titulo set nomeLista= CASE WHEN nomeLista='"+[values[0]];
	consulta +="' AND Usuario_idUsuario="+req.body.idUsuario;
	consulta +=" then '";
	consulta +=[values[1]]+"' END;";
	console.log(consulta)
	connection.query(consulta, function(error, results, fields){
		if(error){
			res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		}else{
			res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
		}
	});
});

module.exports = router;

