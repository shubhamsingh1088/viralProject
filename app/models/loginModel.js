
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var saltRounds = 10;
var myPlaintextPassword = 's0/\/\P4$$w0rD';
var someOtherPlaintextPassword = 'not_bacon';
var titlize = require('mongoose-title-case');

var LoginSchema = new Schema({
	username: { type: String, required: true },
	password: { type: String, select: false },
	active: { type: Boolean, required: false, default: true },
	permission: { type: String, default: 'user' }
});

LoginSchema.pre('save', function(next) {
	var user = this;
  if (!user.isModified('password')) return next();

	bcrypt.hash(user.password, saltRounds, function(err, hash) {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});

LoginSchema.plugin(titlize, {
  paths: ['name']
});

LoginSchema.methods.comparePassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Login', LoginSchema);