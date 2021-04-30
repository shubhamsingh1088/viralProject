
app.config(["$urlRouterProvider", "$stateProvider", "$locationProvider",
	function ($urlRouterProvider, $stateProvider, $locationProvider) {

	$urlRouterProvider.otherwise("/");

	$stateProvider
	.state("main", {
		url: "/",
		views: {
			"": { templateUrl: "templates/main.html" },
			"front@main": { templateUrl: "templates/front/front.html" }
		}
	})
	.state("signup", {
		url: "/signup",
		templateUrl: "templates/login/signup.html",
		controller: "signup",
		authenticated: false
	})
	.state("login", {
		url: "/login",
		templateUrl: "templates/login/login.html",
		controller: "profile",
		authenticated: false
	})
	.state("management", {
		url: "/management",
		templateUrl: "templates/admin/management.html",
		controller: "managementCtrl",
		authenticated: true,
		permission: ["admin", "moderator"]
	})
	.state("management.createMember", {
		url: "/createMember",
		templateUrl: "templates/admin/sideNav/createMember.html",
		controller: "managementCtrl",
		authenticated: true,
		permission: ["admin", "moderator"]
	})
	.state("management.viewMember", {
		url: "/viewMember",
		templateUrl: "templates/admin/sideNav/viewMember.html",
		controller: "managementCtrl",
		authenticated: true,
		permission: ["admin", "moderator"]
	})
	.state("management.assignPost", {
		url: "/assignPost",
		templateUrl: "templates/admin/sideNav/assignPost.html",
		controller: "managementCtrl",
		authenticated: true,
		permission: ["admin", "moderator"]
	})
	.state("profile", {
		url: "/profile",
		templateUrl: "templates/user/profile.html",
		controller: "profile",
		authenticated: true
	})
	.state("editUser", {
		url: "/editUser",
		templateUrl: "templates/user/editUser.html",
		controller: "editUserCtrl",
		authenticated: true
	})
	$locationProvider.html5Mode(true);
}]);

app.run(["$transitions", "Auth", "$state", "Login", function($transitions, Auth, $state, Login) {

	$transitions.onStart({
		to: function (state) {
			return state !== null && state.authenticated === true && state.permission !== ["admin", "moderator"];
		}
	}, function (state) {
		if (!Auth.isLoggedIn()) {
			return $state.target("main");
		} else if (!state.permission) {
			Login.getPermission();
		}
	});
	$transitions.onStart({
		to: function (state) {
			return state !== null && state.authenticated === false;
		}
	}, function (state) {
		if (Auth.isLoggedIn()) {
			return $state.target("profile");
		}
	});

}]);