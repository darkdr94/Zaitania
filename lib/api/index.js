var express = require('express');
var app = module.exports = express();
var session = require('express-session')
var path = require('path');
var Administrador = require(path.resolve("./lib/administrador/models/administrador_schema.js")).Administrador;
var encriptador = require(path.resolve('./recursos/js/encriptar.js'));
var session_middleware = require("./middleware/session.js");
var lexicon = require("./lexicon.js");
app.set('views', __dirname + '/views');

app.use(session({
	secret: "clavesecreta",
	resave: false,
	saveUninitialized: false
}));

app.get("/index", function(solicitud, respuesta) {
	var mensaje = solicitud.session.confirmacion;
	solicitud.session.confirmacion = null;
	respuesta.render("index",{
		confirmacion: mensaje
	});
});

app.get("/loginRevisor", function(solicitud, respuesta) {
	if (solicitud.session.revisor_id) {
		respuesta.redirect("homeLexicon");
	} else {
		respuesta.render("loginLexicon");
	}
});

app.post("/loginRevisor", function(solicitud, respuesta) {
	var username = (solicitud.body.username).toLowerCase();
	var password = solicitud.body.password;
	var passEncriptada = encriptador.encriptar(username, password);
	Administrador.findOne({
		s_user_name: username,
		s_password: passEncriptada
	}, function(err, documento) {
		if (err) {
			return respuesta.status(404).send();
		}
		if (!documento) {
			mensajeError = "Usuario o contraseña incorrectos!"
			respuesta.render("loginLexicon", {
				mensaje: mensajeError
			});
		} else {
			if (documento.s_tipo_usuario == "revisor") {
				solicitud.session.revisor_id = documento._id;
				solicitud.session.user_tipo = documento.s_tipo_usuario;
				respuesta.redirect("homeLexicon");
			} else {
				mensajeError = "Usuario no permitido!"
				respuesta.render("loginLexicon", {
					mensaje: mensajeError
				});
			}
		}
	});
});

app.get('/salirrevisor', function(solicitud, respuesta) {
	solicitud.session.destroy();
	respuesta.redirect('/loginRevisor');
});

app.use("/homeLexicon", session_middleware);
app.use("/homeLexicon", lexicon);