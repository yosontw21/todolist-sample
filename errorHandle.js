const headers = require('./header');

function errorHandle(res) {
	res.writeHead(400, headers);
	res.write(
		JSON.stringify({
			status: 'error',
			message: '資料格式錯誤，或無此 todo id'
		})
	);
	res.end();
}

module.exports = errorHandle;
