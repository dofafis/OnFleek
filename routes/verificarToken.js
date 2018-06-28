var jwt = require('jsonwebtoken');
var config = require('../config');

function verificarToken(req, res, next){
	var token = req.headers['access-token'];
	
	if(!token){
		res.send(JSON.stringify({ "status": 403,"auth": false, "message": 'Token não fornecido.' }));
		return;
	}else{
		jwt.verify(token, config.secret, function(err, decoded){
			if(err){
				
				res.send(JSON.stringify({ "status": 500,"auth": false, 
				"message": 'Não foi possível autenticar o token, tente novamente.' }));
			}else{
				req.idUsuario = decoded.id;
				next();
			}
		});
	}
}

module.exports = verificarToken;
