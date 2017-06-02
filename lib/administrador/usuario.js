var express = require('express');
var router = express.Router();
var Administrador = require("./models/administrador_schema.js").Administrador;
var path = require('path');
var encriptador = require(path.resolve('./recursos/js/encriptar.js'));

router.get("/", function(solicitud, respuesta) {
	global.tipousuario = solicitud.session.user_tipo;
	var mensaje = solicitud.session.confirmacion;
	solicitud.session.confirmacion = null;
	respuesta.render("home", {
		confirmacion: mensaje
	});
});

router.get("/usuario/editar", function(solicitud, respuesta, next) {
	Administrador.findById(solicitud.session.user_id, function(err, usuario) {
		if (err) {
			solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
			respuesta.redirect("/home");
		} else {
			var mensaje = solicitud.session.confirmacion;
			solicitud.session.confirmacion = null;
			respuesta.render("usuario/editar", {
				usuario: usuario,
				confirmacion: mensaje
			});
		}
	});
});

router.post("/usuario/editar/p", function(solicitud, respuesta, next) {
	var pass = solicitud.body.pass;
	var passConf = solicitud.body.confirmPassword;
	solicitud.check('pass', 'La contraseña debe tener entre 8 y 15 caracteres').isLength({
		min: 8,
		max: 15
	});
	solicitud.check('pass', 'Las contraseñas no coinciden').equals(passConf);
	var errors = solicitud.validationErrors();
	if (errors) {
		solicitud.session.confirmacion = errors;
		respuesta.redirect("/home/usuario/editar");
	} else {
		Administrador.findById(solicitud.body.id, function(err, user) {
			var passEncriptada = encriptador.encriptar(solicitud.body.username, pass)
			var passEncriptadaConf = encriptador.encriptar(solicitud.body.username, passConf)
			user.s_password = passEncriptada;
			user.password_confirmation = passEncriptadaConf;
			user.save(function(err) {
				if (err) {
					solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"];
					respuesta.redirect("/home/usuario/editar");
				} else {
					solicitud.session.confirmacion = ["Contraseña cambiada exitosamente!"];
					respuesta.redirect("/home");
				}
			});
		});
	}
});

//gestion de usuarios
router.get("/usuario/lista", function(solicitud, respuesta) {
	if (global.tipousuario == "superadmin") {
		Administrador.find({
			s_tipo_usuario: ["admin", "revisor"]
		}, {
			s_name: 1,
			s_user_name: 1,
			s_tipo_usuario: 1
		}, function(err, usuarios) {
			if (err) {
				solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
				respuesta.redirect("/home");
			}
			var mensaje = solicitud.session.confirmacion;
			solicitud.session.confirmacion = null;
			respuesta.render("usuario/lista", {
				usuarios: usuarios,
				confirmacion: mensaje
			});
		});
	} else {
		solicitud.session.confirmacion = ["Usuario no permitido!"]
		respuesta.redirect("/home");
	}
});

router.get("/usuario/crear", function(solicitud, respuesta) {
	if (global.tipousuario == "superadmin") {
		var tipoUsuarios = ["admin", "revisor"];
		var mensaje = solicitud.session.confirmacion;
		solicitud.session.confirmacion = null;
		respuesta.render("usuario/crear", {
			confirmacion: mensaje,
			tipoUsuarios: tipoUsuarios
		});
	} else {
		solicitud.session.confirmacion = ["Usuario no permitido!"];
		respuesta.redirect("/home");
	}
});

router.post("/usuario/crear", function(solicitud, respuesta) {
	if (global.tipousuario == "superadmin") {
		var pass = solicitud.body.pass;
		var passConf = solicitud.body.confirmPassword;
		solicitud.assert('nombre', 'El campo nombre es requerido').notEmpty();
		solicitud.check('username', 'El campo username es requerido, mínimo 6 caracteres').isLength({
			min: 6
		});
		solicitud.check('pass', 'La contraseña debe tener entre 8 y 15 caracteres').isLength({
			min: 8,
			max: 15
		});
		solicitud.check('pass', 'Las contraseñas no coinciden').equals(passConf);
		var errors = solicitud.validationErrors();
		if (errors) {
			solicitud.session.confirmacion = errors;
			respuesta.redirect("/home/usuario/crear");
		} else {
			var nombreusuario = (solicitud.body.username).toLowerCase();
			var passEncriptada = encriptador.encriptar(nombreusuario, pass)
			var passEncriptada_confirmation = encriptador.encriptar(nombreusuario, passConf);
			var administradoruser = {
				s_name: solicitud.body.nombre,
				s_tipo_usuario: solicitud.body.tipoUsuario,
				s_user_name: nombreusuario,
				password_confirmation: passEncriptada_confirmation,
				s_password: passEncriptada
			}
			var useradm = new Administrador(administradoruser);
			useradm.save(function(err) {
				if (err) {
					solicitud.session.confirmacion = [{msg:"username no disponible"}];
					respuesta.redirect("/home/usuario/crear");
				} else {
					solicitud.session.confirmacion = ["Usuario creado exitosamente!"];
					respuesta.redirect("/home/usuario/lista");
				}
			});
		}
	} else {
		solicitud.session.confirmacion = ["Usuario no permitido!"]
		respuesta.redirect("/home");
	}
});

router.post("/usuario/eliminar", function(solicitud, respuesta) {
	if (global.tipousuario == "superadmin") {
		Administrador.findById(solicitud.body.idusuario, function(err, usuarioAdm) {
			if (err) {
				solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"];
				respuesta.redirect("/home");
			}
			var mensaje = solicitud.session.confirmacion;
			solicitud.session.confirmacion = null;
			respuesta.render("usuario/eliminar", {
				usuarioAdm: usuarioAdm,
				confirmacion: mensaje
			});
		});
	} else {
		solicitud.session.confirmacion = ["Usuario no permitido!"]
		respuesta.redirect("/home");
	}
});

router.post("/usuario/eliminar/p", function(solicitud, respuesta) {
	if (global.tipousuario == "superadmin") {
		var id = solicitud.body.idusuario;
		Administrador.remove({
			"_id": id
		}, function(err, llaves) {
			if (err) {
				solicitud.session.confirmacion = ["Ha ocurrido un error, intentelo de nuevo!"]
				respuesta.redirect("/home");
			} else {
				solicitud.session.confirmacion = ["Usuario eliminado exitosamente!"];
				respuesta.redirect("/home/usuario/lista");
			}
		});
	} else {
		solicitud.session.confirmacion = ["Usuario no permitido!"]
		respuesta.redirect("/home");
	}
});

module.exports = router;