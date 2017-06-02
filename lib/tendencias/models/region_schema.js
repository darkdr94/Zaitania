var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var regionSchema = new Schema({
	s_pais: {
		type: String,
		unique: true,
		required: true

	},
	n_woeid: {
		type: Number,
		unique: true,
		required: true
	}
});

var Region = mongoose.model("region", regionSchema);
exports.Region = Region;