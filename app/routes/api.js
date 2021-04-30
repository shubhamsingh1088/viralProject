

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jwt = require('jsonwebtoken');
var secret = 'harry potter';
var fs = require('fs');
var http = require('http');
var path = require('path');
var qs = require('querystring');

var multer = require('multer');
var uploads = multer({ dest: 'uploads/' });

var Login = require('../models/loginModel');
var Member = require('../models/memberModel');
var Member = require('../models/memberModel');
var User = require('../models/userModel');

module.exports = function(router, app) {

	// user registration route

	router.post('/login', function(req, res) {
		var login = new Login();
		// // login.name = req.body.name;
		// login.email = req.body.email;
		login.username = req.body.username;
		login.password = req.body.password;
		// login.number = req.body.number;

		if (req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '') {
			res.json({ success: false, message: 'Ensure if every detail were provided' });
		} else {
			login.save(function(err, login) {
				if (err) {
					res.send(err);
				} else {
					return res.status(200).json({ success:true, message: 'Account registered! Now you can login' });
				}
			});
		}
	});

	// user login route

	router.post('/authenticate', function(req, res) {
		Login.findOne({ username: req.body.username }).select('username password _id active').exec(function(err, user) {
			if (err) {
				return res.status(500).json(err);
			}
			if (!user) {
				return res.send({ success: false, message: 'Could not authenticate user' });
			} else if (user) {
				if (req.body.password) {
					var validPassword = user.comparePassword(req.body.password);
				} else {
					return res.send({ success: false, message: 'No password provided' });
				}
				if (!validPassword) {
					return res.send({ success: false, message: 'Could not authenticate password' });
				} else {
					var token = jwt.sign({ username: user.username, password: user.password, _id: user._id }, secret);
					return res.status(200).json({ success: true, message: 'User authenticated', token: token });
				}
			}
		});
	});

	router.post('/member', uploads.single('file'), function(req, res) {
		var name = req.body.name;
		var address = req.body.address;
		var gender = req.body.gender;
		var dob = req.body.dob;
		var trade = req.body.trade;
		var aadharNo = req.body.aadharNo;
		var mobNo = req.body.mobNo;
		var whatsappNo = req.body.whatsappNo;
		var areaOI = req.body.areaOI;
		var bGroup = req.body.bGroup;
		var image = req.file.path;

		Member.bulkWrite([
			{ insertOne : { "document": { "name": name, "address": address, "gender": gender, "dob": dob, "trade": trade,
			 "aadharNo": aadharNo, "mobNo": mobNo, "whatsappNo": whatsappNo, "areaOI": areaOI,
			 "bGroup": bGroup, "image": image } } }
			], function(err, result) {
				if (err) {
					res.send("new error");
				} else {
					// res.send("File Uploaded Successfully, Click Back Button to go back to form");
					return res.redirect('back');
				}
			}
		);
	});

	router.get('/getMember', function(req, res) {
		Member.find({}, function(err, members) {
			if (err) throw err;
			if (!members) {
				return res.send({ success: false, message: 'No members found'});
			} else {
				return res.status(200).json({ success: true, members: members });
			}
		});
	});

	router.post('/createUser', function(req, res) {
		var username = req.body.username;
		var message = req.body.message;
		
		User.bulkWrite([
			{ insertOne : { "document": { "username": username, "message": message } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send("File Uploaded Successfully, Click Back Button to go back to form");
				}
			}
		);
	});

	router.use(function(req, res, next) {
		var token = req.body.token || req.body.query || req.headers['x-access-token'];

		if (token) {
			// verify token
			jwt.verify(token, secret, function(err, decoded) {
				if (err) {
					res.json({ success: false, message: 'Token invalid' });
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			res.json({ success: false, message: 'No token provided' });
		}
	});

	router.post('/me', function(req, res) {
		res.send(req.decoded);
	});

	router.get('/permission', function(req, res) {
		Login.findOne({ username: req.decoded.username }, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.send({ success: false, message: 'No user was found' });
			} else {
				res.json({ success: true, permission: user.permission });
			}
		});
	});

	router.get('/profile', function(req, res) {
		Login.findOne({ _id: req.decoded._id }, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.send({ success: false, message: 'No user was found' });
			} else {
				res.json({ success: true, user: user, permission: user.permission });
			}
		});
	});

	return router;
};