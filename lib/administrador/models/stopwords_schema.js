var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stopwordsSchema = new Schema({
	cd_stopwords: [{
		s_palabra: {
			type: String,
			required: true,
			unique: true
		}
	}]
});

var Stopwords = mongoose.model("stopwords", stopwordsSchema);
exports.Stopwords = Stopwords;