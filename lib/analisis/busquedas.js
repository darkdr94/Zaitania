var tendencia = require('../tendencias/consultar_tendencias.js');
var Analisis = require("./models/analisis_schema.js").Analisis;
var async = require('async');

exports.buscarDatos = function(callback) {
	var arProc = [];

	arProc[0] = function(callback) {
		tendencia.buscarTendencia(23424787, function(err, arrTendencias) {
			callback(null, arrTendencias);
		});
	}

	arProc[1] = function(callback) {
		Analisis.aggregate([{
			"$group": {
				_id: "$s_hashtag",
				count: {
					$sum: 1
				}
			}
		}, {
			"$sort": {
				'count': -1
			}
		}, {
			"$limit": 10
		}], function(err, arrBuscados) {
			if (arrBuscados.length != 0) {
				return callback(null, arrBuscados);
			}
			return callback(null, "No hay registros")
		});
	}

	async.parallel(arProc, function(err, results) {
		if (results[0][0].name) {
			var arrTendencias = results[0];
			var arrBuscados = results[1];
		} else if (results[0][0]._id) {
			var arrBuscados = results[0];
			var arrTendencias = results[1];
		}
		callback(null, arrBuscados, arrTendencias);
	});
}