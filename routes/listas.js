/*
ROTAS:
*/
"$what$ever$".split("$").join("\\$")
var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');
var connection = require('../db');
/* GET /listas/nomelista feito com POST pra usar o BODY -- Recebe idusuario nos headers e o nomelista no 
parâmetro e retorna os ids dos títulos que estão na respectiva lista*/
router.post('/nomelista', function(req, res, next) {
	var consulta = 'SELECT idTitulo,nomePortuguesTitulo,nomeOriginalTitulo,sinopseTitulo,diretorTitulo,anoProducaoTitulo,duracaoMinutosTitulo,classificacaoTitulo,paisOrigemTitulo,generoTitulo,tipoTitulo,estreiaMundialTitulo,estreiaBrasilTitulo,caminhoFoto from Usuario_Lista_Titulo,Titulo,foto_Titulo where Usuario_idUsuario='+req.body.idusuario+" AND nomeLista='";
	consulta+=req.body.nomelista+"' AND Titulo.idTitulo=Usuario_Lista_Titulo.Titulo_idTitulo AND Titulo.idTitulo=foto_Titulo.Titulo_idTitulo;";
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
//GET feito com POST /listas/existelista --- Mesma coisa que a rota acima listas/nomelista, porém aqui ele só retorna verdadeiro ou falso se existir ou não uma lista desse usuário com esse nome
router.post('/existelista', function(req, res, next) {
	var consulta = 'SELECT distinct * from Lista where Usuario_idUsuario='+req.body.idusuario+" AND nomeLista='";
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

/* POST /listas Recebe um token do usuario que está criando a lista, também recebe o nome da lista e a lista vem vazia, só se adiciona um título nela na rota abaixo /listas/adicionar*/
router.post('/', verificarToken, function(req, res, next){
	var values = [req.idUsuario,req.body.nomeLista];
	connection.query('INSERT INTO Lista (Usuario_idUsuario,nomeLista) VALUES (?) ON DUPLICATE KEY UPDATE Usuario_idUsuario='+req.idUsuario+',nomeLista='+JSON.stringify(req.body.nomeLista),[values],
		function(error,results,fields){
			if(error){
	                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
       			}else{
				res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
			}
		}
	);
});

/* POST /listas/adicionar adiciona um titulo em uma lista já criada, recebe um token, um idTitulo e um nomeLista para adicoinar o titulo a uma lista */
router.post('/adicionar', verificarToken, function(req, res, next){
	var consulta = "SELECT * FROM Lista WHERE Usuario_idUsuario="+req.idUsuario+" AND nomeLista='";
	consulta+=req.body.nomeLista+"';";
	connection.query(consulta, function(error, results, fields){
		if(error){
                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                }else{
                        if(results.length==0)res.send(JSON.stringify({ "status": 500, "error": "Lista não existe, impossível adiconar titulos", "response": null }));
			else{
				console.log('asdasdasdsa aqui wow');
				consulta = "INSERT INTO Usuario_Lista_Titulo (Usuario_idUsuario,Titulo_idTitulo,nomeLista) VALUES ("+req.idUsuario+","+req.body.idTitulo+",'";
				consulta+=req.body.nomeLista+"') ON DUPLICATE KEY  UPDATE Usuario_idUsuario="+req.idUsuario+",Titulo_idTitulo="+req.body.idTitulo+",nomeLista='";
				consulta+=req.body.nomeLista+"';"
				connection.query(consulta,
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
        });
});

/* PATCH /listas no caso o que tem pra mudar é o nome da Lista, então o usuario envia o token, o nomeLista(atual) e novoNome */
router.patch('/', verificarToken, function(req, res, next){
	var values = [req.body.nomeLista, req.body.novoNome];
	var consulta = "update Lista set nomeLista= CASE WHEN nomeLista='"+[values[0]];
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

/* DELETE /listas recebe um token e um nomeLista, o usuario dono do token terá a lista com esse nome deletada*/
router.delete('/', verificarToken, function(req, res, next){
	req.body.nomeLista += "'";
	connection.query("DELETE FROM Lista WHERE Usuario_idUsuario="+req.idUsuario+" AND nomeLista='"+req.body.nomeLista+";",function(error, results, fields){
		if(error)res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		else{
			res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
		}
	});
});

/* DELETE /listas/remover remove um titulo da lista de titulos de um usuário e recebe o token, nomeLista e um idTitulo a ser removido dessa lista */
router.delete('/remover', verificarToken, function(req, res, next){
	req.body.nomeLista += "'";
	connection.query("DELETE FROM Usuario_Lista_Titulo WHERE Usuario_idUsuario="+req.idUsuario+" AND Titulo_idTitulo="+req.body.idTitulo+" AND nomeLista='"+req.body.nomeLista+";", function(error, results, fields){
		if(error)res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		else res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
	});
});

module.exports = router;

