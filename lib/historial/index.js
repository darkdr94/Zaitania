var express = require('express');
var app = module.exports = express();
var async = require('async');
var busqueda = require('./buscar_Historial.js')
var path = require("path");
var busquedaTendencias = require(path.resolve(__dirname, '../analisis/busquedas.js'));
app.set('views', [__dirname + '/views', path.resolve(__dirname, '../analisis/views')]);

//-------------------------------------------------------------------------------------
app.post("/historial", function(solicitud, respuesta) {
	var hashtag = (solicitud.body.Personaje).toLowerCase();
	var numCont = global.contador.numero;
	busqueda.buscarHistorial(hashtag, function(err, documento) {
		if (err) {
			var mensajeError = "Ha ocurrido un error, intentelo de nuevo";
			respuesta.render("home", {
				mensajeH: mensajeError,
				contador: numCont
			});
			console.log(err)
		} else {
			if (documento.length == 0) {
				busquedaTendencias.buscarDatos(function(err, arrBuscados, arrTendencias) {
					var mensajeSinregistros = "No hay registros para el hashtag buscado";
					respuesta.render("home", {
						mensajeH: mensajeSinregistros,
						contador: numCont,
						buscados: arrBuscados,
						tendencias: arrTendencias
					});
				});
			} else {
				busqueda.graficarHistorial(hashtag, function(err, boolResultado, personajes, favorabilidad, fechas, nombreDIV) {
					if (err) {
						busquedaTendencias.buscarDatos(function(err, arrBuscados, arrTendencias) {
							var mensajeError = "Ha ocurrido un error, intentelo de nuevo";
							respuesta.render("home", {
								mensaje: mensajeError,
								contador: numCont,
								buscados: arrBuscados,
								tendencias: arrTendencias
							});
						});
					} else {
						if (boolResultado = false) {
							busquedaTendencias.buscarDatos(function(err, arrBuscados, arrTendencias) {
								var mensajeSinResultados = "No hay resultados en el historial para la consulta realizada";
								respuesta.render("home", {
									mensaje: mensajeSinResultados,
									contador: numCont,
									buscados: arrBuscados,
									tendencias: arrTendencias
								});
							});
						} else {
							respuesta.render("listado", {
								hashtag: hashtag,
								historial: documento,
								nombres: personajes,
								porcentajes: favorabilidad,
								fechas: fechas,
								nombresID: nombreDIV,
								contador: numCont
							});
						}
					}
				});
			}
		}
	});
});
//---------------------------------------------------------------------------------------
app.post("/historialconjunto", function(solicitud, respuesta) {
	var hashtag = (solicitud.body.Personaje1);
	var numCont = global.contador.numero;
	if (hashtag) {
		busqueda.graficarHistorial(hashtag, function(err, boolResultado, personajes, favorabilidad, fechas, nombreDIV) {
			if (err) {
				busquedaTendencias.buscarDatos(function(err, arrBuscados, arrTendencias) {
					var mensajeError = "Ha ocurrido un error, intentelo de nuevo";
					respuesta.render("home", {
						mensaje: mensajeError,
						contador: numCont,
						buscados: arrBuscados,
						tendencias: arrTendencias
					});
				});
			} else {
				if (boolResultado = false) {
					busquedaTendencias.buscarDatos(function(err, arrBuscados, arrTendencias) {
						var mensajeSinResultados = "No hay resultados en el historial para la consulta realizada";
						respuesta.render("home", {
							mensaje: mensajeSinResultados,
							contador: numCont,
							buscados: arrBuscados,
							tendencias: arrTendencias
						});
					});
				} else {
					busquedaTendencias.buscarDatos(function(err, arrBuscados, arrTendencias) {
						respuesta.render("historial", {
							nombres: personajes,
							porcentajes: favorabilidad,
							fechas: fechas,
							nombresID: nombreDIV,
							tendencias: arrTendencias,
							contador: numCont
						});
					});
				}
			}
		});
	} else {
		var mensajeSeleccionar = "Debe seleccionar al menos un personaje, ingrese una nueva  búsqueda";
		busquedaTendencias.buscarDatos(function(err, arrBuscados, arrTendencias) {
			respuesta.render("home", {
				contador: numCont,
				mensaje: mensajeSeleccionar,
				buscados: arrBuscados,
				tendencias: arrTendencias
			});
		});
	}
});