

angular.module('authService', ["LocalStorageModule"])

.factory('Auth', function($http, AuthToken, localStorageService) {
	authFactory = {};

	authFactory.login = function(loginData) {
		return $http.post('/api/authenticate', loginData).then(function (response) {
			AuthToken.setToken(response.data.token);
			return response;
		});
	};


	// Auth.isLoggedIn();
	authFactory.isLoggedIn = function() {
		if (AuthToken.getToken()) {
			return true;
		} else {
			return false;
		}
	};

	// Auth.getUser();
	authFactory.getUser = function() {
		if (AuthToken.getToken()) {
			return $http.post('/api/me');
		} else {
			$q.reject({ message: 'User has no token' });
		}
	};

	// Auth.logout();
	authFactory.logout = function() {
		AuthToken.setToken();
	};

	return authFactory;
})

.factory('AuthToken', function(localStorageService) {
	var authTokenFactory = {};

	authTokenFactory.setToken = function(token) {
		if (token) {
			localStorageService.set('token', token);
		} else {
			localStorageService.remove('token');
		}
	};

	authTokenFactory.getToken = function() {
		return localStorageService.get('token');
	}

	return authTokenFactory;
})

.factory('AuthInterceptors', function(AuthToken) {
	var authInterceptorsFactory = {};

	authInterceptorsFactory.request = function(config) {

		var token = AuthToken.getToken();

		if (token) config.headers['x-access-token'] = token;

		return config;
	};

	return authInterceptorsFactory;
});