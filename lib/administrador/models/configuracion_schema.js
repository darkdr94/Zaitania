var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var configuracionSchema = new Schema({
	n_maximo_tweet: {
		type: Number,
		min:[200],
		max:[10000],
		unique: false
	},
	n_contador_analisis:{
		type: Number,
		unique: false
	},
	s_consumerkey: {
		type: String,
		unique: true,
		required: true,
		minlength: [25]
	},
	s_consumersecret: {
		type: String,
		unique: true,
		required: true,
		minlength: [50]
	}
});

var Configuracion = mongoose.model("configuracion", configuracionSchema);
exports.Configuracion = Configuracion;