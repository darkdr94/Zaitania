var express = require('express');
var async = require('async');
var router = express.Router();
var consultas = require('./consultas.js');
var path = require('path');
var Administrador = require(path.resolve("./lib/administrador/models/administrador_schema.js")).Administrador;
var encriptador = require(path.resolve('./recursos/js/encriptar.js'));
var Lexicon = require(path.resolve("./lib/administrador/models/lexicon_schema.js")).Lexicon;

router.get("/", function(solicitud, respuesta) {
	global.tipousuario = solicitud.session.user_tipo;
	consultas.listarVersiones(function(err, version) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/index");
		} else {
			var mensaje = solicitud.session.confirmacion;
			solicitud.session.confirmacion = null;
			respuesta.render('homeLexicon', {
				versiones: version,
				confirmacion: mensaje
			});
		}
	});
});

router.get("/lexicon/:version", function(solicitud, respuesta) {
	var version = Number(solicitud.params.version);
	consultas.listarLexicon(version, function(err, lexicon) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/homeLexicon");
		} else {
			var listadoP = lexicon[0].cd_lexicon
			var mensaje = solicitud.session.confirmacion;
			solicitud.session.confirmacion = null;
			respuesta.render('listarLexicon', {
				versiones: version,
				palabras: listadoP,
				confirmacion: mensaje
			});
		}
	});
});

router.get("/crearVersiones", function(solicitud, respuesta) {
	consultas.listarVersiones(function(err, version) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/homeLexicon");
		} else {
			respuesta.render('crearVersion', {
				versiones: version
			});
		}
	});
});

router.post("/crearVersiones/p", function(solicitud, respuesta) {
	var version = Number(solicitud.body.version);
	var descripcion = solicitud.body.descripcion;
	consultas.copiarVersion(version, descripcion, function(err, confirmacion) {
		if (err) {
			solicitud.session.confirmacion = ["Error: No se ha creado la version del lexicón"]
			respuesta.redirect("/homeLexicon");
		} else {
			solicitud.session.confirmacion = ["Versión del lexicón creada correctamente"];
			respuesta.redirect("/homeLexicon");
		}
	});
});

router.get("/lexicon/agregar/:v", function(solicitud, respuesta) {
	var version = solicitud.params.v
	var mensaje = solicitud.session.confirmacion;
	solicitud.session.confirmacion = null;
	if (version != 0) {
		listadoPolaridades = ["positivo", "negativo", "neutral", "modificador", "cuantificador"]
		respuesta.render('agregarPalabra', {
			version: version,
			polaridades: listadoPolaridades,
			confirmacion: mensaje
		});
	} else {
		solicitud.session.confirmacion = ["No se puede agregar palabras a esta versión"];
		respuesta.redirect("/homeLexicon");
	}
});

router.post("/lexicon/agregar", function(solicitud, respuesta) {
	var palabras = solicitud.body.palabra;
	var arrPalabra = palabras.split(";");
	var polaridad = solicitud.body.polaridad;
	var version = Number(solicitud.body.version);
	if (version != 0) {
		consultas.eliminarRepetidas(arrPalabra, function(arrSinRepetir) {
			arBusq = [];
			for (var i = 0; i < arrSinRepetir.length; i++) {
				let palabra = arrSinRepetir[i];
				arBusq[i] = function(callback) {
					consultas.verificarPalabra(version, palabra, polaridad, function(err, existe) {
						if (err) {
							if (existe == 2) {
								return callback(null, "Error: No se pudo verificar la existencia de la palabra " + palabra + " en el lexicón versión " + version);
							} else {
								if (existe == 3) {
									return callback(null, "Error: No se pudo guardar la palabra " + palabra + " correctamente en el lexicón versión " + version);
								}
							}
						} else if (existe == 0) {
							return callback(null, "La palabra " + palabra + " ya existe en el lexicón versión " + version);
						} else {
							if (existe == 1) {
								return callback(null, "La palabra " + palabra + " fue agregada correctamente al lexicón versión " + version);
							}
						}
					});
				}
			}
			async.parallel(arBusq, function(err, results) {
				solicitud.session.confirmacion = results
				respuesta.redirect("/homeLexicon/lexicon/" + version);
			});
		});
	} else {
		solicitud.session.confirmacion = ["No se puede agregar palabras a esta versión"];
		respuesta.redirect("/homeLexicon");
	}

});

router.post("/lexicon/editar", function(solicitud, respuesta) {
	var palabra = solicitud.body.palabra;
	var polaridad = solicitud.body.polaridad;
	var version = Number(solicitud.body.version);
	if (version != 0) {
		listadoPolaridades = ["positivo", "negativo", "neutral", "modificador", "cuantificador"]
		respuesta.render("editarPalabra", {
			version: version,
			palabra: palabra,
			polaridadS: polaridad,
			polaridades: listadoPolaridades
		});
	} else {
		solicitud.session.confirmacion = ["Error: No se puede editar palabras de esta versión"];
		respuesta.redirect("/homeLexicon/lexicon/" + version);
	}

});

router.post("/lexicon/editar/p", function(solicitud, respuesta) {
	var palabra = solicitud.body.palabra;
	var polaridad = solicitud.body.polaridad;
	var version = Number(solicitud.body.version);
	if (version != 0) {
		consultas.editarPalabra(version, palabra, polaridad, function(err, confirmacion) {
			if (err) {
				solicitud.session.confirmacion = ["Error: No se pudo editar la polaridad de la palabra en el lexicón versión " + version];
				respuesta.redirect("/homeLexicon/lexicon/" + version);
			} else {
				solicitud.session.confirmacion = ["Palabra editada correctamente en el lexicón versión " + version];
				respuesta.redirect("/homeLexicon/lexicon/" + version);
			}
		});
	} else {
		solicitud.session.confirmacion = ["Error: No se puede editar palabras de esta versión"];
		respuesta.redirect("/homeLexicon/lexicon/" + version);
	}
});

router.post("/lexicon/eliminar", function(solicitud, respuesta) {
	var palabra = solicitud.body.idpalabra;
	var polaridad = solicitud.body.idpolaridad;
	var version = Number(solicitud.body.version);
	if (version != 0) {
		consultas.eliminarPalabra(version, palabra, polaridad, function(err, confirmacion) {
			if (err) {
				solicitud.session.confirmacion = ["Error: No se pudo eliminar la palabra en el lexicón versión " + version];
				respuesta.redirect("/homeLexicon/lexicon/" + version);
			} else {
				solicitud.session.confirmacion = ["Palabra eliminada correctamente del lexicón versión " + version];
				respuesta.redirect("/homeLexicon/lexicon/" + version);
			}
		});
	} else {
		solicitud.session.confirmacion = ["Error: No se puede eliminar palabras de esta versión"];
		respuesta.redirect("/homeLexicon/lexicon/" + version);
	}
});

//cambiar contraseña
router.get("/usuariolexicon/password", function(solicitud, respuesta, next) {
	Administrador.findById(solicitud.session.revisor_id, function(err, usuario) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/homeLexicon");
		} else {
			var mensaje = solicitud.session.confirmacion;
			solicitud.session.confirmacion = null;
			respuesta.render("password", {
				usuario: usuario,
				errors: solicitud.session.errors,
				confirmacion: mensaje
			});
		}
	});
});

router.post("/usuariolexicon/password/p", function(solicitud, respuesta, next) {
	var pass = solicitud.body.pass;
	var passConf = solicitud.body.confirmPassword;
	solicitud.check('pass', 'Contraseña entre 8 y 15 caracteres').isLength({
		min: 8,
		max: 15
	});
	solicitud.check('pass', 'Contraseñas no coinciden').equals(passConf);
	var errors = solicitud.validationErrors();
	if (errors) {
		solicitud.session.confirmacion = errors;
		respuesta.redirect("/homeLexicon/usuariolexicon/password");
	} else {
		Administrador.findById(solicitud.body.id, function(err, user) {
			var passEncriptada = encriptador.encriptar(solicitud.body.username, pass)
			var passEncriptadaConf = encriptador.encriptar(solicitud.body.username, passConf)
			user.s_password = passEncriptada;
			user.password_confirmation = passEncriptadaConf;
			user.save(function(err) {
				if (err) {
					solicitud.session.confirmacion = [{msg:"Ha ocurrido un error intentelo de nuevo"}];
					respuesta.redirect("/homeLexicon/usuariolexicon/password");
				} else {
					solicitud.session.confirmacion = ["Contraseñas cambiadas exitosamente!"];
					respuesta.redirect("/homeLexicon");
				}
			});
		});
	}
});

module.exports = router;