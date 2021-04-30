
angular.module('memberService', [])

.factory('Member', function($http) {
	memberFactory = {};

	memberFactory.getMember = function() {
		return $http.get('/api/getMember');
	}

	return memberFactory;
});