/*jslint node: true, vars: true, white: true */
"use strict";

var mongoose = require('mongoose');
var user = require('../lib/models/user/user')(mongoose);
var communityMember = require('../lib/models/community/communityMember')(mongoose);
var community = require('../lib/models/community/community')(mongoose, communityMember);
var should = require('should');
var Step = require('step');

mongoose.connect('mongodb://localhost/teamfinder_test');

var clearAll = function(done) {
	new Step(function() {
		communityMember.model.remove({}, this);
	}, function(err) {
		(err === null).should.equal(true);
		user.model.remove({}, this);
	}, function(err) {
		(err === null).should.equal(true);
		community.model.remove({}, this);
	}, function(err) {
		(err === null).should.equal(true);
		done();
	});
};

describe("Users", function() {
	var currrentUser = null;

	beforeEach(function(done) {
		user.model.remove({}, function() {
			user.register("Sam", "12345678", "sam@sam.com", function(err, newUser) {
				(err === null).should.equal(true);
				done();
			});
		});
	});

	afterEach(clearAll);

	it("should register a new user", function(done) {
		user.register("Newuser", "12345678", "sam2@sam.com", function(err, newUser) {
			user.getUser(newUser.username, function(err, testUser) {

				testUser.password.should.not.equal("12345678");
				testUser.email.should.equal("sam2@sam.com");
				testUser.username.should.equal("Newuser");

				testUser.validatePassword("12345678", function(err, validPass) {
					validPass.should.equal(true);
					testUser.validatePassword("123", function(err, validPass) {
						validPass.should.equal(false);
						done();
					});
				});
			});

		});
	});

	it("should get a user", function(done) {
		user.getUser("Sam", function(err, testuser) {
			testuser.username.should.equal("Sam");
			done();
		});
	});

	it("should validate a password", function(done) {
		user.getUser("Sam", function(err, testuser) {
			testuser.validatePassword("1234", function(err, validPass) {
				validPass.should.equal(false);
				testuser.validatePassword("12345678", function(err, validPass) {
					validPass.should.equal(true);
					done();
				});
			});
		});
	});

	it("should set a users password", function(done) {
		user.getUser("Sam", function(err, testuser) {
			testuser.setPassword("123", function(err) {
				err.toString().should.equal("Error: Invalid password");
				testuser.setPassword("123456789", function(err) {
					(err === null).should.equal(true);
					testuser.validatePassword("12345678", function(err2, valid) {
						(err2 === null).should.equal(true);
						valid.should.equal(false);
						testuser.validatePassword("123456789", function(err3, valid) {
							(err3 === null).should.equal(true);
							valid.should.equal(true);
							done();
						});
					});
				});
			});
		});
	});

	it("should change a users password", function(done) {
		user.getUser("Sam", function(err, testuser) {
			testuser.validatePassword("12345678", function(err, validPass) {
				validPass.should.equal(true);
				testuser.changePassword("1234", "1234", function(err) {
					err.toString().should.equal("Error: Old password doesn't match");
					testuser.changePassword("12345678", "123456789", function(err) {
						(err === null).should.equal(true);
						testuser.validatePassword("12345678", function(err, valid) {
							(err === null).should.equal(true);
							valid.should.equal(false);
							testuser.validatePassword("123456789", function(err, valid) {
								(err === null).should.equal(true);
								valid.should.equal(true);
								done();
							});
						});
					});
				});
			});
		});
	});

	it("should change a users email", function(done) {
		user.getUser("Sam", function(err, testuser) {
			testuser.email.should.equal("sam@sam.com");
			testuser.setEmail("notvalidemail", function(err) {
				err.toString().should.equal("Error: Invalid email address");
				testuser.setEmail("sam2@sam.com", function(err) {
					(err === null).should.equal(true);
					testuser.email.should.equal("sam2@sam.com");
					user.getUser("Sam", function(err, testuser) {
						(err === null).should.equal(true);
						testuser.email.should.equal("sam2@sam.com");
						done();
					});
				});
			});
		});
	});
});

describe("Community Creation", function() {
	beforeEach(function(done) {
		new Step(function() {
			user.model.remove({}, this);
		}, function() {
			user.register("Sam", "12345678", "sam@sam.com", this);
		}, function(err, newUser) {
			user.register("Andrew", "12345678", "andrew@andrew.com", this);
		}, function(err, newUser) {
			user.register("Dean", "12345678", "dean@dean.com", this);
		}, function(err, newUser) {
			user.register("Ana", "12345678", "ana@ana.com", this);
		}, function(err, newUser) {
			user.register("Kate", "12345678", "kate@kate.com", this);
		}, function(err, newUser) {
			user.register("Frank", "12345678", "frank@frank.com", this);
		}, function(err, newUser) {
			user.model.count({}, this);
		}, function(err, c) {
			c.should.equal(6);
			done();
		});
	});

	afterEach(clearAll);

	it("should have six users registered", function(done) {
		new Step(function() {
			user.model.count({}, this);
		}, function(err, c) {
			(err === null).should.equal(true);
			c.should.not.equal(5);
			c.should.equal(6);
			done();
		});
	});

	it("should create a new community", function(done) {
		new Step(function() {
			user.getUser("Sam", this);
		}, function(err, sam) {
			(err === null).should.equal(true);
			community.createCommunity("Fnatic Gaming", "Fnatic", sam._id, this);
		}, function(err, fnatic) {
			(err === null).should.equal(true);
			fnatic.name.should.equal("Fnatic Gaming");
			community.model.count({}, this);
		}, function(err, c) {
			(err === null).should.equal(true);
			c.should.equal(1);
			done();
		});
	});
});

describe("Community Functionality", function() {
	var userList = [];
	var communityList = [];

	beforeEach(function(done) {
		new Step(function() {
			user.model.remove({}, this);
		}, function() {
			user.register("Sam", "12345678", "sam@sam.com", this);
		}, function(err, newUser) {
			userList.push(newUser);
			user.register("Andrew", "12345678", "andrew@andrew.com", this);
		}, function(err, newUser) {
			userList.push(newUser);
			user.register("Dean", "12345678", "dean@dean.com", this);
		}, function(err, newUser) {
			userList.push(newUser);
			user.register("Ana", "12345678", "ana@ana.com", this);
		}, function(err, newUser) {
			userList.push(newUser);
			user.register("Kate", "12345678", "kate@kate.com", this);
		}, function(err, newUser) {
			userList.push(newUser);
			user.register("Frank", "12345678", "frank@frank.com", this);
		}, function(err, newUser) {
			userList.push(newUser);
			user.model.count({}, this);
		}, function(err, c) {
			c.should.equal(6);
			done();
		});
	});

	afterEach(clearAll);
	afterEach(function(done) {
		userList = [];
		communityList = [];
		done();
	});

	it("should add a new community and add 3 members", function(done) {
		new Step(function() {
			community.createCommunity("Fnatic Gaming", "Fnatic", userList[0]._id, this);
		}, function(err, fnatic) {
			communityList.push(fnatic);
			fnatic.addUser(userList[1]._id, this);
		}, function(err) {
			(err === null).should.equal(true);
			communityList[0].userCount(this);
		}, function(err, count) {
			(err === null).should.equal(true);
			count.should.equal(1);
			communityList[0].addUser(userList[2]._id, this);
		}, function(err) {
			(err === null).should.equal(true);
			communityList[0].addUser(userList[3]._id, this);
		}, function(err) {
			(err === null).should.equal(true);
			communityList[0].userCount(this);
		}, function(err, count) {
			count.should.equal(3);
			done();
		});
	});

	it("should return an error when you try and remove a member from a community which he/she isn't a part of", function(done) {
		new Step(function() {
			community.createCommunity("Fnatic Gaming", "Fnatic", userList[0]._id, this);
		}, function(err, fnatic) {
			communityList.push(fnatic);
			communityList[0].addUser(userList[1]._id, this);
		}, function(err) {
			if (err) throw err;
			communityList[0].removeUser(userList[2]._id, this);
		}, function(err) {
			err.toString().should.equal("Error: User is not in this community");
			done();
		});
	});

	it("should add a new community, add 3 members and then remove 2 members", function(done) {
		new Step(function() {
			community.createCommunity("Fnatic Gaming", "Fnatic", userList[0]._id, this);
		}, function(err, fnatic) {
			communityList.push(fnatic);
			fnatic.addUser(userList[1]._id, this);
		}, function(err) {
			if (err) throw err;
			communityList[0].userCount(this);
		}, function(err, count) {
			if (err) throw err;
			count.should.equal(1);
			communityList[0].addUser(userList[2]._id, this);
		}, function(err) {
			if (err) throw err;
			communityList[0].addUser(userList[3]._id, this);
		}, function(err) {
			if (err) throw err;
			communityList[0].userCount(this);
		}, function(err, count) {
			if (err) throw err;
			count.should.equal(3);
			communityList[0].removeUser(userList[1]._id, this);
		}, function(err) {
			if (err) throw err;
			communityList[0].userCount(this);
		}, function(err, count) {
			if (err) throw err;
			count.should.equal(2);
			communityList[0].removeUser(userList[2]._id, this);
		}, function(err) {
			if (err) throw err;
			communityList[0].userCount(this);
		}, function(err, count) {
			if (err) throw err;
			count.should.equal(1);
			communityList[0].removeUser(userList[3]._id, this);
		}, function(err) {
			if (err) throw err;
			communityList[0].userCount(this);
		}, function(err, count) {
			if (err) throw err;
			count.should.equal(0);
			done();
		});
	});
});

describe("Main Forums", function() {
	it("should return a list of forum categories", function(done) {
		new Step(function() {
			done();
		});
	});
});

describe("Community Forums", function() {
	it("should return a list of forum categories", function(done) {
		done();
	});
});