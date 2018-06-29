"$what$ever$".split("$").join("\\$") // não lembro porque essa linha foi adicionada, acho que tem a ver com caracteres especiais, não lembro se funcionou ou não, resolvi deixar aí
var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');
var connection = require('../db');

/* POST /avaliacoes cria uma avaliação de um título por um usuario precisa enviar os atributos 'idTitulo' 
e número de 'estrelas' e um token no header*/
router.post('/', verificarToken, function(req, res, next){
	var values = [req.idUsuario,req.body.idTitulo,req.body.estrelas];
	connection.query('INSERT INTO Usuario_Avalia_Titulo (Usuario_idUsuario,Titulo_idTitulo,estrelas) VALUES (?) ON DUPLICATE KEY UPDATE Usuario_idUsuario='+req.idUsuario+',Titulo_idTitulo='+req.body.idTitulo+",estrelas="+req.body.estrelas,[values],
		function(error,results,fields){
			if(error){
	                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
       			}else{
				res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
			}
		}
	);
});


/*DELETE /avaliacoes deleta uma avaliação, recebe um token e o 'idTitulo'*/
router.delete('/', verificarToken, function(req, res, next){
	connection.query("DELETE FROM Usuario_Avalia_Titulo WHERE Usuario_idUsuario="+req.idUsuario+" AND Titulo_idTitulo="+req.body.idTitulo+";",function(error, results, fields){
		if(error)res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		else{
			res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
		}
	});
});

module.exports = router;

