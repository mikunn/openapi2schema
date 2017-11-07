var fs = require('fs')
	,	join = require('path').join
;

module.exports = {
	parseJSON: parseJSON,
	specPath: specPath
};

function parseJSON(file) {
	var path = join(__dirname, 'data', file);
	return JSON.parse(fs.readFileSync(path)); 
}

function specPath(filename) {
	return join(__dirname, 'data', filename);
}
