angular.module('loginService', [])

.factory('Login', function($http) {
	loginFactory = {};

	loginFactory.create = function(regData) {
		return $http.post('/api/login', regData);
	};

	loginFactory.getAllLoginUsers = function() {
		return $http.get('/api/management/');
	};

	// loginFactory.activateAccount = function(token) {
	// 	return $http.put('/api/activate/' + token);
	// }

	// loginFactory.checkCredentials = function(loginData) {
	// 	return $http.post('/api/resend', loginData);
	// };

	// loginFactory.resendLink = function(username) {
	// 	return $http.put('/api/resend', username);
	// };

	loginFactory.sendUsername = function(userData) {
		return $http.get('/api/resetusername/' + userData);
	};

	// loginFactory.sendPassword = function(resetData) {
	// 	return $http.put('/api/resetpassword', resetData);
	// };

	// loginFactory.resetUser = function(token) {
	// 	return $http.get('/api/resetpassword/' + token);
	// };

	// loginFactory.savePassword = function(regData) {
	// 	return $http.put('/api/savepassword', regData);
	// };

	// loginFactory.renewSession = function(username) {
	// 	return $http.get('/api/renewToken/' + username);
	// };

	loginFactory.getPermission = function() {
		return $http.get('/api/permission/');
	};

	// loginFactory.getAllLoginUsers = function() {
	// 	return $http.get('/api/allLoggedInUsers/');
	// };

	loginFactory.deleteOneLoginUser = function(username) {
		return $http.delete('/api/loggedInUser/' + username);
	};

	loginFactory.getUser = function() {
		return $http.get('/api/profile/');
	};

	return loginFactory;
});

