/*jslint node: true, vars: true, white: true */
"use strict";

var Crypto = require('crypto');

var mongoose;
var User;

var userReg = /^[a-zA-Z0-9_-]{3,15}$/;
var passwordReg = /^.{8,}$/;
var emailReg = /^[^@]+@[^@]+\.[^@]+$/;

function toLower(string) {
	return string.toLowerCase();
}

function generateSalt() {
	return Crypto.randomBytes(128).toString('base64');
}

function generateResetLink() {
	return Crypto.randomBytes(128).toString('base64');
}

function encodePassword(password, salt) {
	return Crypto.createHmac('sha512', salt).update(password).digest("base64");
}

function validUsername(username) {
	return username.match(userReg);
}

function uniqueUsername(username, callback) {
	User.findOne({username: username}, function(err, user) {
		if (err) { throw err; }
		callback(user === null);
	});
}

function validEmail(email) {
	return email.match(emailReg);
}

function uniqueEmail(email, callback) {
	email = toLower(email);
	User.findOne({email: email}, function(err, user) {
		if (err) { throw err; }
		callback(user === null);
	});
}

function validPassword(password) {
	return password.match(passwordReg);
}

var getUser = function(username, callback) {
	User.findOne({username: username}, callback);
};

var createUser = function(username, password, email, callback) {
	var salt = generateSalt();
	var hash = encodePassword(password, salt);

	var newUser = new User({username: username, email: email, salt: salt, password: hash});

	newUser.save(function(err) {
		if (err) {
			callback(err);
		} else {
			callback(null, newUser);
		}
	});
};

module.exports = function(_mongoose) {
	mongoose = _mongoose;

	var userSchema = new mongoose.Schema({
		username: {
			type: String,
			required: true,
			unique: true
		},
		email: {
			type: String,
			set: toLower,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		salt: {
			type: String,
			required: true
		},
		resetLink: {
			resetText: String,
			expires: Date
		},
		admin: Boolean,
		banned: {
			type: Boolean,
			'default': false
		},
		forumData: {
			signature: String,
			numPosts: Number
		}
	});

	userSchema.methods.setEmail = function(email, callback) {
		if (!email.match(emailReg)) { callback(new Error("Invalid email address")); return; }

		this.email = email;
		this.save(callback);
	};

	userSchema.methods.setPassword = function(password, callback) {
		if (!password.match(passwordReg)) { callback(new Error("Invalid password")); return; }

		var newSalt = generateSalt();
		var hash = encodePassword(password, newSalt);

		this.salt = newSalt;
		this.password = hash;
		this.save(callback);
	};

	userSchema.methods.changePassword = function(oldPass, newPass, callback) {
		var that = this;
		this.validatePassword(oldPass, function(err, valid) {
			if (err) { callback(err); return; }
			if (!valid) { callback(new Error("Old password doesn't match")); return; }

			that.setPassword(newPass, callback);
		});
	};

	userSchema.methods.validatePassword = function(password, callback) {
		var newHash = encodePassword(password, this.salt);
		callback(null, this.password === newHash);
	};

	userSchema.methods.createPasswordReset = function(callback) {
		var newLink = generateResetLink();

		var now = new Date();
		var expires = new Date(now.getTime() + (24 * 60 * 60 * 1000));

		this.resetLink = {
			resetText: newLink,
			expires: expires
		};

		this.save(function(err) {
			if (err) {callback(err); return; }
			callback(null, newLink);
		});
	};

	userSchema.methods.validatePasswordReset = function(resetText, callback) {
		var currentTime = new Date();

		if (!this.resetLink) {
			callback(null, false);
			return;
		}

		if (currentTime > this.resetLink.expires) {
			this.resetLink = undefined;
			this.save();
			callback(null, false);
			return;
		}

		if (this.resetLink.resetText === resetText) {
			callback(null, true);
			return;
		}

		callback(null, false);
	};

	userSchema.methods.removeResetLink = function(callback) {
		this.resetLink = undefined;
		this.save(callback);
	};

	userSchema.methods.makeAdmin = function(callback) {
		this.admin = true;
		this.save(callback);
	};

	userSchema.methods.removeAdmin = function(callback) {
		this.admin = false;
		this.save(callback);
	};

	User = mongoose.model("User", userSchema);

	return {
		validUsername: validUsername,
		uniqueUsername: uniqueUsername,
		validEmail: validEmail,
		uniqueEmail: uniqueEmail,
		validPassword: validPassword,
		createUser: createUser,
		getUser  : getUser,
		model    : User
	};
};

