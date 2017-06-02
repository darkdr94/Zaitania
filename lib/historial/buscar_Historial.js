var Analisis = require("../analisis/models/analisis_schema.js").Analisis;
var async = require('async');

exports.buscarHistorial = function(hashtag, callback) {
	Analisis.find({
			s_hashtag: hashtag
		}, {
			"s_fecha": 1,
			"n_tweets_descargados": 1,
			"d_resultados.n_favorabilidad": 1,
			"d_resultados.n_num_analisis": 1,
			"_id": 0
		 },
		function(err, documento) {
			if (err) {
				return callback(err, null);
			}
			callback(null, documento);
		});
}

exports.graficarHistorial = function(hashtag, callback) {
	var arBusq = [];
	if (typeof(hashtag) == "string") {
		let hashTemp = [];
		hashTemp[0] = hashtag;
		hashtag = hashTemp;
	}
	for (var i = 0; i < hashtag.length; i++) {
		let hashtagb = hashtag[i];
		arBusq[i] =
			function(callback) {
				Analisis.find({
					s_hashtag: hashtagb
				}, {
					"s_fecha": 1,
					"d_resultados.n_favorabilidad": 1,
					"_id": 0
				}, {
					limit: 20,
					sort: {
						's_fecha': -1
					}
				}, function(err, documento) {
					if (err) {
						return callback(err, null);
					}
					if (documento.length == 0) {
						return callback(null, 0);
					}
					return callback(null, documento);
				});
			}
	}
	async.parallel(arBusq, function(err, results) {
		if (err) {
			return callback(err, null, null, null, null, null);
		}
		var boolResultado = false;
		var personajes = "";
		var fechas = "";
		var favorabilidad = "";
		var nombreDIV = []

		for (var i = 0; i < results.length; i++) {
			if (results[i] != 0) {
				boolResultado = true;
				if (i > 0) {
					personajes = personajes + "-";
					fechas = fechas + "-";
					favorabilidad = favorabilidad + "-";
				}
				personajes = personajes + hashtag[i];
				for (var j = 0; j < results[i].length; j++) {
					if (j > 0) {
						fechas = fechas + "," + results[i][j].s_fecha;
						favorabilidad = favorabilidad + "," + results[i][j].d_resultados.n_favorabilidad;
					} else {
						fechas = fechas + (results[i][j].s_fecha);
						favorabilidad = favorabilidad + (results[i][j].d_resultados.n_favorabilidad);
					}
				}
				nombreDIV.push("grafica" + ((nombreDIV.length) + 1));
			}
		}
		callback(null, boolResultado, personajes, favorabilidad, fechas, nombreDIV)
	});
}