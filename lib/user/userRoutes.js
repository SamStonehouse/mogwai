/*jslint node: true, vars: true, white: true */
"use strict";

var user;
var form;
var field;
var validate;

var init = function(app) {
	app.get('/register', register);
	app.post('/register', form(
		field("username").trim().required().custom(function(value) {
			if (!user.validUsername(value)) {
				throw new Error("Invalid username");
			}
		}).custom(function(value) {
			user.uniqueUsername(value, function(uniqueUsername) {
				if (!uniqueUsername) {
					throw new Error("username is already taken");
				}
			});
		}),
		field("password").required().custom(function(value) {
			if (!user.validPassword(value)) {
				throw new Error("invalid password");
			}

			//return;
		}),
		field("email").trim().required().custom(function(value) {
			if (!user.validEmail(value)) {
			// 	throw new Error("invalid email");
			 } else if (!user.uniqueEmail(value)) {
			// 	throw new Error("email is already taken");
			// }

			//return;
		})),
	registerAttempt);
};

var register = function(req, res) {
	var errors = req.form && req.form.getErrors() ||  {};
	var values = req.body || {};
	res.render('pages/user/register', { title : 'port | Create An Account', errors: errors, values: values });
};

var registerAttempt = function(req, res) {
	console.log("Register attempt");
	if (!req.form.isValid) {
		// Handle errors
		console.log("Error creating account");
		console.log(req.form.getErrors());
		register(req,res);
	} else {
		// Or, use filtered form data from the form object:
		var username = req.form.username;
		var email = req.form.email;
		var password = req.form.password;

		user.createUser(username, password, email, function(err, user) {
			if (err !== null) {
				console.log("Error registering user");
				//Register fail

				res.render('pages/generic/successPage', {
					title: "Error creating account",
					message: err
				});

				return;
			}
			loginSession(req, user);
			res.render('pages/generic/successPage', {
				title: "Successfully Created Account",
				message: "Another message"
			});
		});
	}
};

var loginSession = function(req, user) {
	req.session.user = user;
	req.session.loggedIn = true;
};

var logoutSession = function(req) {
	req.session.loggedIn = false;
	req.session.user = undefined;
};

var login = function(req, res) {
	res.render('pages/user/login', { title: "port | Login" });
};

var loginRequest = function(req, res) {
	logoutSession(req);
	res.render('pages/generic/successPage', {
		title: "Successfully Logged Out",
		message: "I needed to put something here so here is that 'something'"
	});
};

var logoutRequest = function(req,res) {

};

module.exports = function(_user, _form) {

	user = _user;
	form = _form;
	field = form.field;
	validate = form.validate;

	return {
		init : init
	};
};