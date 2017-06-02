var path = require("path");
var Configuracion = require(path.resolve(__dirname, "../", "../lib/administrador/models/configuracion_schema.js")).Configuracion;
var colaClaves = require("./cola.js").colaClaves;

exports.configurar = function(callback) {
	Configuracion.find({},
		function(err, results) {
			if (err) {
				console.log(err)
			}
			for (let i = 0; i < results.length; i++) {
				if (results[i].n_maximo_tweet) {
					var numeroM = results[i].n_maximo_tweet;
					var contador = results[i].n_contador_analisis;
					var idContador = results[i]._id;
				} else {
					colaClaves.insertarPrimero(results[i].s_consumerkey, results[i].s_consumersecret);
				}
			}
			var config = {
				parametros: {
					numeroMaximo: numeroM
				},
				claves: colaClaves,
				contador: {
					id: idContador,
					numero: contador
				}
			}
			callback(null, config);
		});
}