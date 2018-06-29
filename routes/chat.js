var express = require('express');
var router = express.Router();
var verificarToken = require('./verificarToken');
var connection = require('../db');

router.post('/', verificarToken, function(req, res, next){
	var values = [req.idUsuario,req.body.idUsuario2,req.body.mensagem];
	if(req.idUsuario!=req.body.idUsuario1){
		res.status(402).send(JSON.stringify({ "status": 402, "error": "Usuário que está mandando a mensagem não é o dono do token, não autorizado", "repsonse": null }));
		return;
	}
	req.body.mensagem += "'";
	connection.query('INSERT INTO Usuario_Conversa_Usuario (Usuario_idUsuario1,Usuario_idUsuario2,mensagem) VALUES (?) ON DUPLICATE KEY UPDATE Usuario_idUsuario1='+req.idUsuario+',Usuario_idUsuario2='+req.body.idUsuario2+",mensagem='"+req.body.mensagem,[values],
		function(error,results,fields){
			if(error){
	                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
       			}else{
				res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
			}
		}
	);
});


router.delete('/:idmensagem', verificarToken, function(req, res, next){
	connection.query("DELETE FROM Usuario_Conversa_Usuario WHERE idMensagem="+req.params.idmensagem+";",function(error, results, fields){
		if(error)res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
		else{
			res.send(JSON.stringify({ "status": 200, "error": null, "response": "Consulta bem sucedida!" }));
		}
	});
});

module.exports = router;

