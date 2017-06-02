var express = require('express');
var router = express.Router();
var fs = require('fs');
var Lexicon = require("./models/lexicon_schema.js").Lexicon;
var Stopwords = require("./models/stopwords_schema.js").Stopwords;
var _redis = require("redis");
var redis = _redis.createClient();

router.get("/recursos", function(solicitud, respuesta) {
	if (solicitud.session.user_tipo == "superadmin") {
		Lexicon.find({}, {
			"_id": 0,
			"n_version": 1
		}, function(err, listaV) {
			if (err) {} else {
				var mensaje = solicitud.session.confirmacion;
				solicitud.session.confirmacion = null;
				respuesta.render('recursos', {
					versiones: listaV,
					confirmacion: mensaje
				});
			}
		});
	} else {
		solicitud.session.confirmacion = ["Usuario no permitido!"]
		respuesta.redirect("/home");
	}
});

router.post("/recursos/crear", function(solicitud, respuesta) {
	if (solicitud.session.user_tipo == "superadmin") {
		var ver = Number(solicitud.body.version);
		Lexicon.find({
			n_version: ver
		}, {
			"cd_lexicon": 1,
			"_id": 0
		}, function(err, lexicon) {
			if (err) {
				solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
				respuesta.redirect("/home");
			} else {
				var listadoP = lexicon[0].cd_lexicon
				var arreglo = ""
				for (var i = 0; i < listadoP.length; i++) {
					arreglo = arreglo + listadoP[i].s_palabra + "\t;\t" + listadoP[i].s_polaridad + "\n"
				}
				fs.writeFile('lib/analisis/Scripts_Python/lexicon', arreglo, encoding = 'utf8', function(err) {
					if (err) {
						console.log(err);
					} else {
						redis.del('lexicon', function(error, result) {
							if (error) {
								solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
								respuesta.redirect("/home");
							}
						});
					}
				});
				Lexicon.find({}, {
					"_id": 0,
					"n_version": 1
				}, function(err, listaV) {
					if (err) {} else {
						solicitud.session.confirmacion = ["Lexicón actualizado correctamente"]
						respuesta.redirect('/home/recursos');
					}
				});
			}
		});
	} else {
		solicitud.session.confirmacion = ["Usuario no permitido!"]
		respuesta.redirect("/home");
	}
});

router.post("/recursos/crearStopwords", function(solicitud, respuesta) {
	if (solicitud.session.user_tipo == "superadmin") {
		Stopwords.find({
			"cd_stopwords": {
				$exists: true
			}
		}, {
			"cd_stopwords": 1,
			"_id": 0
		}, function(err, stopwords) {
			if (err) {
				solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
				respuesta.redirect("/home");
			} else {
				var listadoP = stopwords[0].cd_stopwords
				var arreglo = ""
				for (var i = 0; i < listadoP.length; i++) {
					arreglo = arreglo + listadoP[i].s_palabra + "\n"
				}

				fs.writeFile('lib/analisis/Scripts_Python/listStopWords', arreglo, encoding = 'utf8', function(err) {
					if (err) {
						console.log(err);
					} else {
						redis.del('stopwords', function(error, result) {
							if (error) {
								solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
								respuesta.redirect("/home");
							}
						});
					}
				});
				Lexicon.find({}, {
					"_id": 0,
					"n_version": 1
				}, function(err, listaV) {
					if (err) {solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
								respuesta.redirect("/home");
						} else {
						solicitud.session.confirmacion = ["Stopwords actualizadas correctamente"]
						respuesta.redirect('/home/recursos');
					}
				});
			}
		});
	} else {
		solicitud.session.confirmacion = ["Usuario no permitido!"]
		respuesta.redirect("/home");
	}
});

module.exports = router;