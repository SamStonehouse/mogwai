/*jslint node: true, vars: true, white: true */

// in ApplicationErrors.js
var util = require('util');

var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this)
  this.message = msg || 'Error'
}

var FieldError = function(field, msg, constr) {
	Error.captureStackTrace(this, constr || this);
	this.message = msg || 'Error';
	this.field = msg || 'Unknown';
};



util.inherits(FieldError, Error);
AbstractError.prototype.name = 'Abstract Error'

var DatabaseError = function (msg) {
  DatabaseError.super_.call(this, msg, this.constructor)
}
util.inherits(DatabaseError, AbstractError)
DatabaseError.prototype.name = 'Database Error'

module.exports = {
  Database: DatabaseError
}