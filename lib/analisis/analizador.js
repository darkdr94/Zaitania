var rutaScriptPath = 'lib/analisis/Scripts_Python';
var rutaTemp = 'lib/analisis/';

exports.procesarHashtag = function(numMax, clave1, clave2, hashtag, callback) {
	var PythonShell = require('python-shell');
	var options = {
		mode: 'text',
		pythonPath: '/usr/bin/python2.7',
		pythonOptions: ['-u'],
		encoding: 'utf-8',
		scriptPath: rutaScriptPath,
		args: [clave1, clave2, hashtag, numMax, rutaTemp]
	};
	var d = new Date();
	console.log(d.getHours(),d.getMinutes(),d.getSeconds());
	PythonShell.run('main.py', options, function(err, results) {
		if (err) {
			throw err
			return callback(null);
		}
		callback(results);
		var d = new Date();
		console.log(d.getHours(),d.getMinutes(),d.getSeconds());
	});
}