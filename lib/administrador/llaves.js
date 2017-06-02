var express = require('express');
var router = express.Router();
var Configuracion = require("./models/configuracion_schema.js").Configuracion;
var path = require('path');
var parametrizacion = require(path.resolve('./recursos/js/parametros.js'));

router.get("/llaves/lista", function(solicitud, respuesta) {
	Configuracion.find({
		"s_consumerkey": {
			$exists: true
		},
		"s_consumersecret": {
			$exists: true
		}
	}, {
		"s_consumerkey": 1,
		"s_consumersecret": 1
	}, function(err, llaves) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/home");
		} else {
			var mensaje = solicitud.session.confirmacion;
			solicitud.session.confirmacion = null;
			respuesta.render("llaves/lista", {
				llaves: llaves,
				confirmacion: mensaje
			});
		}
	});
});

router.post("/llaves/editar", function(solicitud, respuesta) {
	var consumer = solicitud.body.consumer;
	var consumersecret = solicitud.body.consumersecret;
	Configuracion.find({
		's_consumerkey': consumer,
		"s_consumersecret": consumersecret
	}, {
		"s_consumerkey": 1,
		"s_consumersecret": 1
	}, function(err, llaves) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"];
			respuesta.redirect("/home");
		} else {
			respuesta.render("llaves/editar", {
				llaves: llaves
			});
		}
	});
});

router.post("/llaves/editar/p", function(solicitud, respuesta) {
	var consumerkey = solicitud.body.consumer;
	var consumersecret = solicitud.body.consumersecret;
	solicitud.check('consumer', 'consumerkey invalida').isLength({
		min: 25,
		max: 25
	});
	solicitud.check('consumer', 'consumerkey requerida').notEmpty();
	solicitud.check('consumersecret', 'consumersecret invalida').isLength({
		min: 50,
		max: 50
	});
	solicitud.check('consumersecret', 'consumersecret requerida').notEmpty();
	var errors = solicitud.validationErrors();
	if (errors) {
		solicitud.session.confirmacion = errors;
		respuesta.redirect("/home/llaves/lista");
	} else {
		Configuracion.findById(solicitud.body.id, {
			"s_consumerkey": 1,
			"s_consumersecret": 1
		}, function(err, llaves) {
			llaves.s_consumerkey = consumerkey;
			llaves.s_consumersecret = consumersecret;
			llaves.save(function(err) {
				if (err) {
					solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
					respuesta.redirect("/home");
				} else {
					solicitud.session.confirmacion = [{
						msg: "Claves modificadas correctamente!"
					}];
					respuesta.redirect("/home/llaves/lista");
					parametrizacion.configurar(function(err, res) {
						global.claves = res.claves;
					});
				}
			});
		});
	}
});

router.get("/llaves/crear", function(solicitud, respuesta) {
	var mensaje = solicitud.session.confirmacion;
	solicitud.session.confirmacion = null;
	respuesta.render("llaves/crear", {
		confirmacion: mensaje
	});
});

router.post("/llaves/crear", function(solicitud, respuesta) {
	solicitud.check('consumer', 'consumerkey invalida').isLength({
		min: 25,
		max: 25
	});
	solicitud.check('consumer', 'consumerkey requerida').notEmpty();
	solicitud.check('consumersecret', 'consumersecret invalida').isLength({
		min: 50,
		max: 50
	});
	solicitud.check('consumersecret', 'consumersecret requerida').notEmpty();
	var errors = solicitud.validationErrors();
	if (errors) {
		solicitud.session.confirmacion = errors;
		respuesta.redirect("/home/llaves/crear");
	} else {
		var consumerkey = solicitud.body.consumer;
		var consumersecret = solicitud.body.consumersecret;
		var llaves = {
			s_consumerkey: consumerkey,
			s_consumersecret: consumersecret
		}
		var consumers = new Configuracion(llaves);
		consumers.save(function(err) {
			if (err) {
				solicitud.session.confirmacion = [{
					msg: "Claves ingresadas ya existen!"
				}];
				respuesta.redirect("/home/llaves/crear");
			} else {
				solicitud.session.confirmacion = [{
					msg: "Claves creadas correctamente!"
				}];
				respuesta.redirect("/home/llaves/lista");
				parametrizacion.configurar(function(err, res) {
					global.claves = res.claves;
				});
			}
		});
	}
});

router.post("/llaves/eliminar", function(solicitud, respuesta) {
	Configuracion.findById(solicitud.body.idllave, {
		"s_consumerkey": 1,
		"s_consumersecret": 1
	}, function(err, llaves) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/home");
		} else {
			respuesta.render("llaves/eliminar", {
				llaves: llaves
			});
		}
	});
});

router.post("/llaves/eliminar/p", function(solicitud, respuesta) {
	var id = solicitud.body.id;
	Configuracion.remove({
		"_id": id
	}, function(err, llaves) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/home");
		} else {
			solicitud.session.confirmacion = [{
				msg: "Claves eliminadas correctamente!"
			}];
			respuesta.redirect("/home/llaves/lista");
			parametrizacion.configurar(function(err, res) {
				global.claves = res.claves;
			});
		}
	});
});

module.exports = router;