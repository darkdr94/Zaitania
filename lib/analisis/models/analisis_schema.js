var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var analisisSchema = new Schema({
	s_hashtag: {
		type: String,
		required: true,
		unique: false
	},
	s_fecha: {
		type: String,
		required: true,
		unique: false
	},
	n_estado: {
		type: Number,
		required: true
	},
	n_tweets_descargados: {
		type: Number,
		required: true
	},
	d_procesamiento: {
		s_descarga: String,
		s_preprocesamiento: String,
		s_polaridad: String,
		s_estadisticas: String
	},
	d_resultados: {
		n_favorabilidad: Number,
		n_num_analisis: Number,
		n_tiempo_ejec: Number
	}
});

var Analisis = mongoose.model("analisis", analisisSchema);
exports.Analisis = Analisis;