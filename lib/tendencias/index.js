var express = require('express');
var app = module.exports = express();
var consulta = require('./consultar_tendencias.js')
var path = require("path");
app.set('views', [__dirname + '/views', path.resolve(__dirname, '../analisis/views')]);

app.get("/regiones", function(solicitud, respuesta) {
	consulta.buscarPaises(function(resultado) {
		var paisTendencia = ""
		for (var i = 0; i < resultado.length; i++) {
			let bandera = (resultado[i].s_pais).replace(" ", "_");
			resultado[i].bandera = bandera;
		}
		respuesta.render("regiones", {
			paises: resultado
		});
	});
});

app.get("/regiones/:id", function(solicitud, respuesta) {
	var woeid = solicitud.params.id;
	consulta.buscarPaises(function(resultado) {
		consulta.buscarTendencia(woeid, function(err, arrTendencias) {
			if (err) {
				respuesta.redirect("/regiones");
			} else {
				var paisTendencia = ""
				for (var i = 0; i < resultado.length; i++) {
					let bandera = (resultado[i].s_pais).replace(" ", "_");
					resultado[i].bandera = bandera;
					if (resultado[i].n_woeid == woeid) {
						paisTendencia = resultado[i].s_pais;
					}
				}
				respuesta.render("regiones", {
					paises: resultado,
					tendencias: arrTendencias,
					nombrePais: paisTendencia
				});
			}
		});
	});
});