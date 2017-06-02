var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var methodoverride = require('method-override');
var app = express();
mongoose.connect("mongodb://localhost/Zaitania"); //nombre de la base de datos

// modulos.
var analisis = require('./lib/analisis');
var historial = require('./lib/historial');
var administrador = require('./lib/administrador');
var tendencias = require('./lib/tendencias');
var api = require('./lib/api');

// all environments
app.set('port', process.env.PORT || 1234); // puerto que utiliza la aplicación
app.set("view engine", "jade");
app.use(bodyParser.json());
app.use(expressValidator());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static("recursos"));
app.use(methodoverride("_method"));

//rutas
app.use(analisis)
app.use(historial)
app.use(administrador)
app.use(tendencias)
app.use(api)

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
