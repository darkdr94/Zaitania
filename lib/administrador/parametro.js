var express = require('express');
var router = express.Router();
var Configuracion = require("./models/configuracion_schema.js").Configuracion;
var path = require('path');
var parametrizacion = require(path.resolve('./recursos/js/parametros.js'));

router.get("/parametro/lista", function(solicitud, respuesta) {
	Configuracion.find({
		"n_maximo_tweet": {
			$exists: true
		}
	}, {
		"n_maximo_tweet": 1
	}, function(err, numMax) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/home");
		} else {
			var mensaje = solicitud.session.confirmacion;
			solicitud.session.confirmacion = null;
			respuesta.render("parametro/lista", {
				numMax: numMax,
				confirmacion: mensaje
			});
		}
	});
});

router.post("/parametro/editar", function(solicitud, respuesta) {
	Configuracion.findById(solicitud.body.id, {
		"n_maximo_tweet": 1
	}, function(err, numMaximo) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/home");
		} else {
			respuesta.render("parametro/editar", {
				numMax: numMaximo
			});
		}
	});
});

router.post("/parametro/editar/p", function(solicitud, respuesta) {
	var numeroMaximo = solicitud.body.numMax;
	solicitud.check('numMax', 'El número máximo de Tweets debe estar entre 200 a 10000').isInt({
		min: 200,
		max: 10000
	});
	var errors = solicitud.validationErrors();
	if (errors) {
		solicitud.session.confirmacion = errors;
		respuesta.redirect("/home/parametro/lista");
	} else {
		Configuracion.findById(solicitud.body.id, {
			"n_maximo_tweet": 1
		}, function(err, numMax) {
			numMax.n_maximo_tweet = numeroMaximo;
			numMax.save(function(err) {
				if (err) {
					solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
					respuesta.redirect("/home");
				} else {
					solicitud.session.confirmacion = [{msg:"Máximo de tweets cambiados correctamente!"}];
					respuesta.redirect("/home/parametro/lista");
					parametrizacion.configurar(function(err, res) {
						global.maxTweets = res.parametros.numeroMaximo;
					});
				}
			});
		});
	}
});

module.exports = router;