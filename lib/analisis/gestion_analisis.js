var datos = require("./asentar_datos.js");
var analizador = require("./analizador.js");
var async = require('async');

exports.gestionarAnalisis = function(h1, h2, h3, numTweets, claves, callback) {
	var contador = 0;
	var arHash = [];
	var arProc = [];
	analizarHashtag(h1, h2, h3, function(resultAH) {
		arHash = resultAH.hashtags;
		contador = resultAH.contador;
	});
	for (let i = 0; i < contador; i++) {
		let hash = arHash[i];
		let clave1 = claves.consumerKey;
		let clave2 = claves.consumerSecret;
		arProc[i] =
			function(callback) {
				analizador.procesarHashtag(numTweets, clave1, clave2, hash, function(resultado) {
					if (!resultado) {
						return callback("Error en la conexión con Python", null);
					}
					if (resultado[2] == 2) {
						return callback("Error con la descarga de Tweets", null);
					}
					if (resultado[2] == 1 && resultado[3] == 0) {
						return callback("Error con la descarga de Tweets", null);
					}
					if (resultado[2] == 0) {
						var docAnalisis = {
							r: 0
						};
						return callback(null, docAnalisis);
					}
					var porcent = Math.round((resultado[5]) * 10000) / 100;
					resultado[5] = porcent
					var docAnalisis = {
						r: resultado[2],
						hashtag: resultado[0],
						tweetsDescargados: resultado[3],
						favorabilidad: resultado[5],
						numeroAnalizados: resultado[6]
					};
					callback(null, docAnalisis);
					datos.guardarDatos(resultado);
				});
			}
	}

	async.parallel(arProc, function(err, results) {
		if (err) {
			return callback(err, null);
		}
		var favorabilidad = "";
		var personajes = "";
		var documentAnalizados = [];
		var boolExiste = false;
		var retorno = [];
		for (let i = 0; i < contador; i++) {
			if (results[i].r == 1) {
				if (boolExiste == true) {
					favorabilidad = favorabilidad + "," + results[i].favorabilidad;
					personajes = personajes + "," + results[i].hashtag;
				} else {
					favorabilidad = results[i].favorabilidad;
					personajes = results[i].hashtag;
					boolExiste = true;
				}
				documentAnalizados.push(results[i]);
			} 
		}
		retorno.push(favorabilidad);
		retorno.push(personajes);
		retorno.push(documentAnalizados);
		callback(null, retorno);
		datos.actualizarContador();
	});
}

function analizarHashtag(h1, h2, h3, callback) {
	if (h1 == h2 || h1 == h3 || h2 == h3) {
		if (h1 == h2) {
			h2 = '';
		}
		if (h1 == h3) {
			h3 = '';
		} else {
			if (h2 == h3) {
				h3 = '';
			}
		}
	}
	var contador = 0;
	var hashtagsTemp = [];
	if (h1 != '' || h2 != '' || h3 != '') {
		if (h1 != '') {
			hashtagsTemp.push(h1);
			contador += 1;
		}
		if (h2 != '') {
			hashtagsTemp.push(h2);
			contador += 1;
		}
		if (h3 != '') {
			hashtagsTemp.push(h3);
			contador += 1;
		}
	}
	var documento = {
		hashtags: hashtagsTemp,
		contador: contador
	}
	callback(documento);
}