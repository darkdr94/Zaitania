var path = require('path');
var Lexicon = require(path.resolve("./lib/administrador/models/lexicon_schema.js")).Lexicon;

exports.listarVersiones = function(callback) {
	Lexicon.find({}, {
		"n_version": 1,
		"s_descripcion": 1
	}, function(err, version) {
		if (err) {
			return callback(err, null);
		}
		return callback(null, version);
	});
}

exports.copiarVersion = function(version, descripcion, callback) {
	obtenerUltimaV(function(err, nuevaVersion) {
		if (err) {
			return callback(err, null);
		}
		Lexicon.find({
			n_version: version
		}, {
			"_id": 0,
			"cd_lexicon": 1
		}, function(err, lexicon) {
			var listadoP = lexicon[0].cd_lexicon
			var nuevoDocumento = {
				n_version: nuevaVersion,
				cd_lexicon: listadoP,
				s_descripcion: descripcion
			};
			var nuevoLexicon = new Lexicon(nuevoDocumento);
			nuevoLexicon.save(function(err) {
				if (err) {
					return callback(err, null);
				}
				return callback(null, true);
			});
		});

	});
}

exports.listarLexicon = function(version, callback) {
	Lexicon.find({
		n_version: version
	}, {
		"cd_lexicon": 1,
		"_id": 0
	}, function(err, lexicon) {
		if (err) {
			return callback(err, null)
		}
		return callback(null, lexicon)
	});
}

exports.verificarPalabra = function(version, palabra, polaridad, callback) {
	Lexicon.find({
		n_version: version,
		"cd_lexicon.s_palabra": palabra
	}, {
		"_id": false,
		"cd_lexicon.$": 1
	}, function(err, existe) {
		if (err) {
			return callback(err, 2) //si hay error en verificar
		}
		if (existe.length != 0) {
			return callback(null, 0) //existe palabra
		}
		agregarPalabra(version, palabra, polaridad, function(err, confirmacion) {
			if (err) {
				return callback(err, 3) // si hay error en guardar
			}
			if (confirmacion) {
				return callback(null, 1) //no existe palabra y se guardo
			}
		});
	});
}

exports.editarPalabra = function(version, palabra, polaridad, callback) {
	Lexicon.update({
		n_version: version,
		"cd_lexicon.s_palabra": palabra
	}, {
		$set: {
			"cd_lexicon.$": {
				"s_palabra": palabra,
				"s_polaridad": polaridad
			}
		}
	}, function(err, confirmacion) {
		if (err) {
			return callback(err, null);
		}
		return callback(null, true);
	});
}

exports.eliminarPalabra = function(version, palabra, polaridad, callback) {
	Lexicon.update({
		n_version: version
	}, {
		$pull: {
			"cd_lexicon": {
				"s_palabra": palabra,
				"s_polaridad": polaridad
			}
		}
	}, function(err, confirmacion) {
		if (err) {
			return callback(err, null);
		}
		return callback(null, true);
	});
}

exports.eliminarRepetidas = function(arrPalabras, callback) {
	arrSinRepetir = arrPalabras.unique();
	callback(arrSinRepetir);
}

Array.prototype.unique = function(a) {
	return function() {
		return this.filter(a)
	}
}(function(a, b, c) {
	return c.indexOf(a, b + 1) < 0
});

function obtenerUltimaV(callback) {
	Lexicon.find({}, {
		"n_version": 1,
		"_id": 0
	}, function(err, version) {
		if (err) {
			return callback(err, null);
		}
		var nuevaVersion = version[version.length - 1].n_version;
		return callback(null, nuevaVersion + 1);
	});
}

function agregarPalabra(version, palabra, polaridad, callback) {
	Lexicon.update({
		n_version: version
	}, {
		$addToSet: {
			cd_lexicon: {
				"s_palabra": palabra,
				"s_polaridad": polaridad
			}
		}
	}, function(err, confirmacion) {
		if (err) {
			return callback(err, null);
		}
		return callback(null, true);
	});
}