var express = require('express');
var app = module.exports = express();
var gestion = require('./gestion_analisis.js');
var busqueda = require('./busquedas.js');
var path = require("path");
var parametrizacion = require(path.resolve('./recursos/js/parametros.js'));
parametrizacion.configurar(function(err, res) {
	global.maxTweets = res.parametros.numeroMaximo;
	global.claves = res.claves;
	global.contador = res.contador;
});

app.set('views', [__dirname + '/views', path.resolve(__dirname, '../historial/views')]);

app.get("/", function(solicitud, respuesta) {
	var numCont = global.contador.numero;
	busqueda.buscarDatos(function(err, arrBuscados, arrTendencias) {
		respuesta.render("home", {
			contador: numCont,
			buscados: arrBuscados,
			tendencias: arrTendencias
		});
	});
});

//-------------------------------------------------------------------------------------
app.post("/analisis", function(solicitud, respuesta) {
	var h1 = (solicitud.body.Hashtag1).toLowerCase();
	var h2 = (solicitud.body.Hashtag2).toLowerCase();
	var h3 = (solicitud.body.Hashtag3).toLowerCase();
	var numCont = global.contador.numero;
	if (h1 == '' && h2 == '' && h3 == '') {
		busqueda.buscarDatos(function(err, arrBuscados, arrTendencias) {
			var error = "Debe ingresar al menos una consulta";
			respuesta.render("home", {
				mensaje: error,
				contador: numCont,
				buscados: arrBuscados,
				tendencias: arrTendencias
			});
		});
	} else {
		var numTweets = global.maxTweets;
		var claves = global.claves.extraerUltimo();
		global.claves.insertarPrimero(claves.consumerKey, claves.consumerSecret);

		gestion.gestionarAnalisis(h1, h2, h3, numTweets, claves, function(err, results) {
			if (err) {

				busqueda.buscarDatos(function(err, arrBuscados, arrTendencias) {
					var error = "Ha ocurrido un error con la descarga de los Tweets, intento de nuevo en unos instantes"
					respuesta.render("home", {
						mensaje: error,
						contador: numCont,
						buscados: arrBuscados,
						tendencias: arrTendencias
					});
				});
			} else {
				var favorabilidad = results[0];
				var personajes = results[1];
				var documentAnalizados = results[2];
				if (favorabilidad == "") {
					busqueda.buscarDatos(function(err, arrBuscados, arrTendencias) {
						var error = "No se encontraron Tweets para la consulta realizada";
						respuesta.render("home", {
							mensaje: error,
							contador: numCont,
							buscados: arrBuscados,
							tendencias: arrTendencias
						});
					});
				} else {
					busqueda.buscarDatos(function(err, arrBuscados, arrTendencias) {
						respuesta.render("resultados", {
							porcentaje: favorabilidad,
							nombres: personajes,
							numeroAnalizado: documentAnalizados,
							buscados: arrBuscados,
							tendencias: arrTendencias,
							contador: numCont + 1
						});
					});
				}
			}
		});
	}
});