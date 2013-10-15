/*jslint node: true, vars: true, white: true */
"use strict";

var user;

var canCreateGroup = function(user) {
	if (user.admin) {
		return  {per: true};
	}

	return { per: false, reason: "Not an admin" };
};

var canCreateCategory = function(user, group) {
	if (user.admin) {
		return { per: true };
	}

	return { per: false, reason: "Not an admin" };
};

var canCreateTopic = function(user, category) {
	if (user.admin) {
		return { per: true };
	}

	if (user === null) {
		return { per: false, reason: "User not logged in" };
	}

	if (user.banned) {
		return { per: false, reason: "User is banned" };
	}

	return { per: true };
};

var canCreatePost = function(user, topic) {
	if (user.admin) {
		return { per: true };
	}

	if (user === null) {
		return { per: false, reason: "User not logged in" };
	}

	if (user.banned) {
		return { per: false, reason: "User is banned" };
	}

	return { per: true };
};

module.exports = function(_user) {
	user = _user;

	return {
		canCreateGroup: canCreateGroup,
		canCreateCategory: canCreateCategory,
		canCreateTopic: canCreateTopic,
		canCreatePost: canCreatePost
	};
};