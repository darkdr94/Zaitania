var express = require('express');
var app = module.exports = express();
var session = require('express-session')
var usuario = require("./usuario.js");
var parametro = require("./parametro.js");
var llaves = require("./llaves.js");
var router_recursos = require("./creacion_recursos.js");
var path = require('path');
var encriptador = require(path.resolve('./recursos/js/encriptar.js'));
var session_middleware = require("./middleware/session.js");
var Administrador = require("./models/administrador_schema.js").Administrador;
app.set('views', __dirname + '/views');

app.use(session({
	secret: "clavesecreta",
	resave: false,
	saveUninitialized: false
}));

app.get("/login", function(solicitud, respuesta) {
	solicitud.session.mensajeC = null;
	solicitud.session.confirmacion = null;
	solicitud.session.errors = null;
	if (solicitud.session.user_id) {
		respuesta.redirect("home");
	} else {
		respuesta.render("login");
	}
});

app.post("/login", function(solicitud, respuesta) {
	var username = (solicitud.body.username).toLowerCase();
	var password = solicitud.body.password;
	var passEncriptada = encriptador.encriptar(username, password);
	console.log(passEncriptada);
	Administrador.findOne({
		s_user_name: username,
		s_password: passEncriptada
	}, function(err, documento) {
		if (err) {
			return respuesta.status(404).send();
		}
		if (!documento) {
			mensajeError = "Usuario o contraseña incorrectos!"
			respuesta.render("login", {
				mensaje: mensajeError
			});
		} else {
			if (documento.s_tipo_usuario == "superadmin" || documento.s_tipo_usuario == "admin") {
				solicitud.session.user_id = documento._id;
				solicitud.session.user_tipo = documento.s_tipo_usuario;
				solicitud.session.user_name=documento.s_name;
				respuesta.redirect("home");
			} else {
				mensajeError = "Usuario no permitido!"
				respuesta.render("login", {
					mensaje: mensajeError
				});
			}
		}
	});
});

app.get('/salir', function(solicitud, respuesta) {
	solicitud.session.destroy();
	respuesta.redirect('/login');
});

app.use("/home", session_middleware);
app.use("/home", usuario);
app.use("/home", parametro);
app.use("/home", router_recursos);
app.use("/home", llaves);