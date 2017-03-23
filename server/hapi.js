'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
const questions = require('../questions.json');

server.connection({port: 2001, host: 'localhost', routes: { cors: true } });

server.route({
	method: 'GET',
	path: '/questions',
	handler: function (request, reply) {
		reply(questions);
	}
});

server.route({
	method: 'POST',
	path: '/answers',
	handler: function (request, reply) {
		console.log(request.payload)
		reply('Ok');
	}
});

server.start((err) => {
	if (err) {
		throw err;
	}

	console.log(`Server running at: ${server.info.uri}`);
});
