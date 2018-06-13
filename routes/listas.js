/*
ROTAS:
 - POST /listas cria lista, envia usuario,titulo e nome da lista e coloca no banco, recebe também um token para verificar que é um usuario do sistema
 - PATCH /listas/:nome/add recebe nome de uma lista no parâmetro e token do usuario
*/


var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');
var connection = require('../db');
/* GET listas listing. */
router.get('/:nomelista', function(req, res, next) {
	connection.query('SELECT nomeLista from Usuario_Lista_Titulo where Usuario_idUsuario=? AND nomeLista=?;', req.headers.idusuario, [req.params.nomelista], function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
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
// POST listas
router.post('/', verificarToken, function(req, res, next){
	connection.query('SELECT * FROM Usuario_Lista_Titulo WHERE Usuario_idUsuario=?;',[req.idUsuario],
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
							res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
						}
					}
				);
			}
		}
	);
});
 module.exports = router;
