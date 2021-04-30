
var app = angular.module('newApp', ["ui.router", "authService", "loginService", "memberService"])
.run(function($anchorScroll, $window) {
  // hack to scroll to top when navigating to new URLS but not back/forward
  var wrap = function(method) {
    var orig = $window.window.history[method];
    $window.window.history[method] = function() {
      var retval = orig.apply(this, Array.prototype.slice.call(arguments));
      $anchorScroll();
      return retval;
    };
  };
  wrap('pushState');
  wrap('replaceState');
})

app.config(function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
});

app.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptors');
});

app.directive("match", function() {
  return {
    restrict: "A",
    controller:  function($scope) {

      $scope.confirmed = false;

      $scope.doConfirm = function(values) {
        values.forEach(function(ele) {

          if ($scope.confirm == ele) {
            $scope.confirmed = true;
          } else {
            $scope.confirmed = false;
          }

        });
      }
    },
    link: function($scope, element, attrs) {
      attrs.$observe("match", function() {
        $scope.matches = JSON.parse(attrs.match);
        $scope.doConfirm($scope.matches);
      });

      $scope.$watch("confirm", function() {
        $scope.matches = JSON.parse(attrs.match);
        $scope.doConfirm($scope.matches);
      });

    }
  };
});

app.controller("signup", ["$scope", "Login", "$location", "$timeout", function($scope, Login, $location, $timeout) {

  $scope.addUser = function(regData, valid) {
    $scope.disabled = true;
    $scope.errorMsg = false;

    if (valid) {
      Login.create($scope.regData).then(function (response) {
        if (response.data.success) {
          $scope.loading = false;
          $scope.successMsg = response.data.message;
        } else {
          $scope.loading = false;
          $scope.disabled = false;
          $scope.errorMsg = response.data.message;
        }
      });
    } else {
      $scope.disabled = false;
      $scope.loading = false;
      $scope.errorMsg = 'Please ensure form is filled out properly';
    }
  };

}]);

app.controller("profile", ["$scope", "Auth", "$timeout", "$location", "localStorageService", "$transitions", "$interval", 
  "$state", "AuthToken", "Login", function($scope, Auth, $timeout, $location, localStorageService, $transitions, $interval, $state, AuthToken, Login) {

    $scope.loadMe = false;

  $scope.checkSession = function() {
    if (Auth.isLoggedIn()) {
      $scope.checkingSession = true;
      var interval = $interval(function() {
        var token = localStorageService.get('token');
        if (token === null) {
          $interval.cancel(interval);
        } else {
          self.parseJwt = function(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
          }
          var expireTime = self.parseJwt(token);
          var timeStamp = Math.floor(Date.now() / 1000);
          var timeCheck = expireTime.exp - timeStamp;
          if (timeCheck <= 10) {
            showModal(1);
            $interval.cancel(interval);
          }
        }
      }, 20000);
    }
  };

  $scope.checkSession();

  var showModal = function(option) {
    $scope.choiceMade = false;
    $scope.modalHeader = undefined;
    $scope.modalBody = undefined;
    $scope.hideButton = false;

    if (option === 1) {
      $scope.modalHeader = "Timeout warning";
      $scope.modalBody = "Your session will expire in 10 seconds. Would you like to renew your session.?";
      $("#myModal").modal({ backdrop: "static" });
    } else if (option === 2) {
      $scope.hideButton = true;
      $scope.modalHeader = "Logging out";
      $("#myModal").modal({ backdrop: "static" });
      $timeout(function() {
        Auth.logout();
        $location.path('/main');
        hideModal();
        window.location.reload(true);
      }, 1000);
    }
    $timeout(function () {
      if (!$scope.choiceMade) {
        hideModal();
      }
    }, 10000);
  };

  $scope.renewSession = function() {
    $scope.choiceMade = true;

    Login.renewSession($scope.Username).then(function(response) {
      if (response.data.success) {
        AuthToken.setToken(response.data.token);
        $scope.checkSession();
      } else {
        $scope.modalBody = response.data.message;
      }
    });
    hideModal();
  };

  $scope.endSession = function() {
    $scope.choiceMade = true;
    hideModal();
    $timeout(function() {
      showModal(2);
    }, 2000);
  };

  var hideModal = function() {
    $("#myModal").modal('hide');
  };

  $transitions.onStart({}, function() {

    if (!$scope.checkSession) {
      $scope.checkSession();
    }

    if (Auth.isLoggedIn()) {
      $scope.isLoggedIn = true;

      Login.getUser().then(function (response) {
      	
        $scope.Username = response.data.user.username;
        $scope.Id = response.data.user._id;

        Login.getPermission().then(function (response) {
          if (response.data.permission === "admin" || response.data.permission === "moderator") {
            $scope.authorized = true;
            $scope.loadme = true;
          } else {
            $scope.loadme = true;
          }
        });

      });

    } else {
      $scope.isLoggedIn = false;
      $scope.username = '';
      $scope.loadme = true;
    }
    if ($location.hash() == '_=_') $location.hash(null);
    $scope.disabled = false;
    $scope.errorMsg = false;
  });

  $scope.doLogin = function(loginData) {
    $scope.errorMsg = false;
    $scope.expired = false;
    $scope.disabled = false;

    Auth.login($scope.loginData).then(function(response) {

      if (response.data.success) {
        $scope.disabled = true;
        $scope.successMsg = response.data.message + "....Redirecting";
         $timeout(function() {
          $location.path('/management');
        }, 2000);
      } else {
        if (response.data.expired) {
          $scope.expired = true;
          $scope.errorMsg = response.data.message;
        } else {
          $scope.loading = false;
          $scope.errorMsg = response.data.message;
        }
      }
    });
  }

  $scope.logout = function() {
    showModal(2);
  };

}]);

app.controller("managementCtrl", ["$scope", "Member", function($scope, Member) {

	$scope.trade = {
    model: null,
    availableOptions: [
       { name: "Vibhag" },
       { name: "Jila" },
       { name: "Prakhand" },
       { name: "Khand" }
    ]
  };

  $scope.bGroup = {
  	model: null,
  	availableOptions: [
       { name: "A+" },
       { name: "A-" },
       { name: "B+" },
       { name: "B-" },
       { name: "O+" },
       { name: "O-" },
       { name: "AB+" },
       { name: "AB-" }
    ]
  };

  $scope.gender = {
  	model: null,
  	availableOptions: [
       { name: "Male" },
       { name: "Female" },
       { name: "Other" }
    ]
  };

  $scope.createUser = function() {
  	$.post('api/createUser', { username: $scope.username, message: $scope.message }, function(res) {
  		console.log(res);
  	});
  };

  Member.getMember().then(function(response) {
    $scope.members = response.data.members;
  });



}]);

app.controller("editUserCtrl", ["$scope", "$stateParams", "Login", "$timeout", function($scope, $stateParams, Login, $timeout) {

  //users section

  Login.getUser().then(function (response) {
    $scope.Username = response.data.user.username;
    $scope.Name = response.data.user.name;
    $scope.Email = response.data.user.email;
    $scope.Number = response.data.user.number;
    $scope.Id = response.data.user._id;
  });

  $scope.usernameTab = "active";
  $scope.phase1 = true;

  $scope.usernamePhase = function() {
    $scope.usernameTab = "active";
    $scope.nameTab = "default";
    $scope.emailTab = "default";
    $scope.passwordTab = "default";
    $scope.numberTab = "default";
    $scope.phase1 = true;
    $scope.phase2 = false;
    $scope.phase3 = false;
    $scope.phase4 = false;
    $scope.phase5 = false;
  };

  $scope.namePhase = function() {
    $scope.usernameTab = "default";
    $scope.nameTab = "active";
    $scope.emailTab = "default";
    $scope.passwordTab = "default";
    $scope.numberTab = "default";
    $scope.phase1 = false;
    $scope.phase2 = true;
    $scope.phase3 = false;
    $scope.phase4 = false;
    $scope.phase5 = false;
  };

  $scope.emailPhase = function() {
    $scope.usernameTab = "default";
    $scope.nameTab = "default";
    $scope.emailTab = "active";
    $scope.passwordTab = "default";
    $scope.numberTab = "default";
    $scope.phase1 = false;
    $scope.phase2 = false;
    $scope.phase3 = true;
    $scope.phase4 = false;
    $scope.phase5 = false;
  };

  $scope.passwordPhase = function() {
    $scope.usernameTab = "default";
    $scope.nameTab = "default";
    $scope.emailTab = "default";
    $scope.passwordTab = "active";
    $scope.numberTab = "default";
    $scope.phase1 = false;
    $scope.phase2 = false;
    $scope.phase3 = false;
    $scope.phase4 = true;
    $scope.phase5 = false;
  };

  $scope.numberPhase = function() {
    $scope.usernameTab = "default";
    $scope.nameTab = "default";
    $scope.emailTab = "default";
    $scope.passwordTab = "default";
    $scope.numberTab = "active";
    $scope.phase1 = false;
    $scope.phase2 = false;
    $scope.phase3 = false;
    $scope.phase4 = false;
    $scope.phase5 = true;
  };

  $scope.updateUserProfile = function(valid) {
    $scope.disabled = true;
    $scope.errorMsg = false;

    if (valid) {
      $.post("api/editUser", { id: $scope.Id, newUsername: $scope.Username, newName: $scope.Name, 
        newEmail: $scope.Email, newNumber: $scope.Number }, function(response) {
          console.log(response);
      });
    } else {
      $scope.disabled = false;
      $scope.loading = false;
      $scope.errorMsg = 'Please ensure form is filled out properly';
    }
  }

}]);