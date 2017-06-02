var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lexiconSchema = new Schema({
	n_version: {
		type: Number,
		required: true,
		unique: true
	},
	s_descripcion:{
		type: String,
		required: true,
		unique: false
	},
	cd_lexicon: [{
		s_palabra: {
			type: String,
			required: true,
			index: false
		},
		s_polaridad: {
			type: String,
			required: true,
			unique: false
		}
	}]
});

lexiconSchema.index({
	"lexicon.s_palabra": 1,
	"n_version": 1
}, {
	unique: true
});

var Lexicon = mongoose.model("lexicon", lexiconSchema);
exports.Lexicon = Lexicon;