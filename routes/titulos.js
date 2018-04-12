var express = require('express');
var router = express.Router();

/* GET titulos listing. */
router.get('/todos', function(req, res, next) {
	connection.query('SELECT * from Titulo', function (error, results, fields) {
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
        connection.query('SELECT * from Titulo where idTitulo=?;', req.params.id, function (error, results, fields) {
                if(error){
                        res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
                        //If there is error, we send the error in the error section with 500 status
                } else {
                        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
                        //If there is no error, all is good and response is 200OK.
                }
        });
});

/* POST titulos */
router.post('/',function(req, res, next) {
	var jsondata = req.body;
	var values = [jsondata.nomeTitulo, jsondata.categoriaTitulo, jsondata.descricaoTitulo];

	connection.query('INSERT INTO Titulo (nomeTitulo,categoriaTitulo,descricaoTitulo) VALUES (?);', [values], 
		function (error, results, fields) {
			if(error){
				res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			} else {
				res.send(JSON.stringify({"status": 200, "error": error, "response": null}));
			}
		});
});

/* PATCH títulos */
router.patch('/:id', function(req, res, next){
	var jsondata = req.body;
	var values = [];
	if(!(typeof req.body.nomeTitulo === 'undefined')){
		var valor = req.body.nomeTitulo+"'";
		values.push("nomeTitulo='"+valor);
	}
	if(!(typeof req.body.categoriaTitulo === 'undefined')){
		var valor = req.body.categoriaTitulo+"'";
                values.push("categoriaTitulo='"+valor);
        }
	if(!(typeof req.body.descricaoTitulo === 'undefined')){
		var valor = req.body.descricaoTitulo+"'";
                values.push("descricaoTitulo='"+valor);
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

