/*jslint node: true, vars: true, white: true */
"use strict";

var express = require('express');
var lessMiddleware = require('less-middleware');
var mongoose = require('mongoose');
var form = require('express-form');

var user = require('./lib/user/user')(mongoose);
var userRoutes = require('./lib/user/userRoutes')(user, form);

var routes = require('./routes');

var header = require('./lib/common/header')();

var COOKIE_SECRET = "SOMETHINGSOMETHINGSECRET";

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.cookieParser(COOKIE_SECRET));
app.use(express.session());
app.use(express.bodyParser());
app.use(lessMiddleware({
        src: __dirname + '/public',
        compress: true
    }));
app.use(errorHandler.clientErrorHandler);
app.use(errorHandler.errorHandler);
app.use(app.router);
app.use(express.static(__dirname + '/public'));

routes.init(app);
userRoutes.init(app);

mongoose.connect('mongodb://localhost/mogwai');

app.listen(3000);
console.log("Listening on port 3000");