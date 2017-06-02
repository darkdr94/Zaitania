var https = require('https');
var Region = require("./models/region_schema.js").Region;

exports.buscarPaises = function(callback) {
	Region.find({}, {
		's_pais': 1,
		'n_woeid': 1,
		'_id': 0
	}, function(err, paises) {
		if (err) {
			return callback(null);
		}
		callback(paises)
	});
}

exports.buscarTendencia = function(pais, callback) {
	var headers = {
		'User-Agent': 'Coding Defined',
		Authorization: 'Bearer ' + require('./oauth.json').access_token
	};
	var trendOptions = {
		host: 'api.twitter.com',
		path: '/1.1/trends/place.json?id=0' + pais,
		headers: headers
	}
	callTwitter(trendOptions, function(err, trendsArray) {
		if(err){
			return callback(err, null);
		}
		callback(null, trendsArray[0].trends);
	});
}

function callTwitter(options, callback) {
	https.get(options, function(response) {
		jsonHandler(response, callback);
	}).on('error', function(e) {
		callback("Error", null);
		console.log('Error call: ' + e.message);
	})
}

function jsonHandler(response, callback) {
	var json = '';
	response.setEncoding('utf8');
	if (response.statusCode === 200) {
		response.on('data', function(chunk) {
			json += chunk;
		}).on('end', function() {
			callback(null, JSON.parse(json));
		});
	} else {
		callback("Error", null);
		console.log('Error JSON: ' + response.statusCode);
	}
}