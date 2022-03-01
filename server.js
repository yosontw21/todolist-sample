const http = require('http');
const port = 3005;
const sucHandle = require('./successHandle');
const errHandle = require('./errorHandle');
const headers = require('./header');

const { v4: uuidv4 } = require('uuid');

const todos = [];

const requestListener = (req, res) => {
	const reqUrl = req.url;
	const reqMethod = req.method;
	const todoId = reqUrl.startsWith('/todos/');

	let body = '';
	req.on('data', (chuck) => {
		body += chuck;
	});
	if (reqUrl == '/todos' && reqMethod == 'GET') {
		sucHandle(res, todos);
	} else if (reqUrl == '/todos' && reqMethod == 'POST') {
		req.on('end', () => {
			try {
				const title = JSON.parse(body).title;
				if (title !== undefined) {
					const addTodo = {
						title: title,
						id: uuidv4()
					};
					todos.push(addTodo);
					sucHandle(res, todos);
				} else {
					errHandle(res);
				}
			} catch (error) {
				errHandle(res);
			}
		});
	} else if (reqUrl == '/todos' && reqMethod == 'DELETE') {
		if (todos.length === 0) {
			res.writeHead(400, headers);
			res.write(
				JSON.stringify({
					status: 'error',
					message: '刪除失敗! 目前代辦沒有任何資料'
				})
			);
			res.end();
		} else {
			todos.length = 0;
			res.writeHead(200, headers);
			res.write(
				JSON.stringify({
					status: 'success',
					message: '刪除所有代辦成功'
				})
			);
			res.end();
		}
	} else if (todoId && reqMethod == 'DELETE') {
		const id = reqUrl.split('/').pop();
		const index = todos.findIndex((el) => el.id == id);
		if (index !== -1) {
			todos.splice(index, 1);
			sucHandle(res, todos);
		} else {
			errHandle(res);
		}
	} else if (todoId && reqMethod == 'PATCH') {
		req.on('end', () => {
			try {
				const todo = JSON.parse(body).title;
				const id = reqUrl.split('/').pop();
				const index = todos.findIndex((el) => el.id == id);
				if (todo !== undefined && index !== -1) {
					todos[index].title = todo;
					sucHandle(res, todos);
				} else {
					errHandle(res);
				}
			} catch (error) {
				errHandle(res);
			}
		});
	} else if (reqMethod == 'OPTIONS') {
		res.writeHead(200, headers);
		res.end();
	} else {
		res.writeHead(404, headers);
		res.write(
			JSON.stringify({
				status: 'error',
				message: '路由或是格式資料錯誤 !'
			})
		);
		res.end();
	}
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || port);
