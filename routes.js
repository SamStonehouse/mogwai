/*jslint node: true, vars: true, white: true */
"use strict";

var app;

//var main = require('./lib/main/mainRoutes')();

var init = function(_app, _forumRoutes, _userRoutes) {
	app = _app;

	//app.get('/', main.index);
};

module.exports =  {
	init: init
};