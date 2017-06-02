var fs = require('fs');
var async = require('async');
var Analisis = require("./models/analisis_schema.js").Analisis;
var Configurar = require("../administrador/models/configuracion_schema.js").Configuracion;

exports.guardarDatos = function(resultado) {
	var ruta = 'lib/analisis/Scripts_Python/temp/' + resultado[4];

	if (resultado[6] > 0) {
		var arregloLect = [];
		var arregloRutas = [];
		arregloRutas[0] = ruta;
		arregloRutas[1] = ruta + " V4";
		arregloRutas[2] = ruta + " V5";
		arregloRutas[3] = ruta + " P";

		for (let i = 0; i < 4; i++) {
			let rutaTemp = arregloRutas[i]
			arregloLect[i] =
				function(callback) {
					leerArchivos(rutaTemp, function(resultadoP) {
						callback(null, resultadoP);
					});
				}
		}
		async.parallel(arregloLect, function(err, results) {
			var datosGuardar = {
				s_hashtag: resultado[0],
				s_fecha: resultado[1],
				n_estado: resultado[2],
				n_tweets_descargados: resultado[3],
				d_procesamiento: {
					s_descarga: results[0],
					s_preprocesamiento: results[1],
					s_polaridad: results[2],
					s_estadisticas: results[3]
				},
				d_resultados: {
					n_favorabilidad: resultado[5],
					n_num_analisis: resultado[6],
					n_tiempo_ejec: resultado[7]
				}
			};

			var analisis = new Analisis(datosGuardar);
			analisis.save(function(err) {
				if (err) {
				}
			});
			eliminarArchivos(ruta);
		});
	} else {
		eliminarArchivos(ruta);
	}
}

function leerArchivos(ruta, callback) {
	fs.open(ruta, 'r+', function(err, fd) {
		if (err) {
		}
		fs.readFile(fd, function(err, datos) {
			if (err) {
			};
			callback(datos);
			fs.close(fd, function(err) {
				if (err) {
				}
			});
		});
	});
}

function eliminarArchivos(ruta) {
	try {
		fs.unlink(ruta, function(err) {
			if (err) {
			}
		});
		try {
			fs.unlink(ruta + " V1", function(err) {
				if (err) {
				}
			});
		} catch (err) {
		}
		try {
			fs.unlink(ruta + " V1 1", function(err) {
				if (err) {
				}
			});
		} catch (err) {
		}
		try {
			fs.unlink(ruta + " V2", function(err) {
				if (err) {
				}
			});
		} catch (err) {
		}
		try {
			fs.unlink(ruta + " V3", function(err) {
				if (err) {
					console.log(err);
				}
			});
		} catch (err) {
		}
		try {
			fs.unlink(ruta + " V4", function(err) {
				if (err) {
				}
			});
		} catch (err) {
		}
		try {
			fs.unlink(ruta + " V5", function(err) {
				if (err) {
				}
			});
		} catch (err) {
		}

		try {
			fs.unlink(ruta + " P", function(err) {
				if (err) {
					console.log(err);
				}
			});
		} catch (err) {
		}
		try {
			fs.unlink(ruta + " P T", function(err) {
				if (err) {
					console.log(err);
				}
			});
		} catch (err) {
		}

	} catch (err) {
	}
}

exports.actualizarContador = function() {
	var idContador = global.contador.id
	Configurar.findById(idContador, {
		"n_contador_analisis": 1
	}, function(err, results) {
		if (err) {} else {
			var contSave = results.n_contador_analisis;
			results.n_contador_analisis = (contSave + 1);
			results.save(function(err) {
				if (err) {} else {
					global.contador.numero = (contSave + 1)
				}
			})
		}

	});
}