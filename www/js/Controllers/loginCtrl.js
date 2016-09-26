"use strict";


app.controller('loginCtrl', function($scope, $http, $location, $ionicLoading, $ionicPlatform, $timeout, $ionicModal, ionicMaterialMotion, ionicMaterialInk, OAuthService, SOCIAL, UtilityService, authFactory, firebaseURL) {
  
  var ref = new Firebase(firebaseURL);

  var oAuthService = OAuthService;
  var util = UtilityService;

  var PROBLEM_AUTHENTICATION = 'Problem authenticating';
	var THE_SIGN_IN_FLOW_WAS_CANCELED = 'The sign in flow was canceled';
	var BROWSER_AUTHENTICATION_FAILED = 'Browser authentication failed to complete';

  $ionicPlatform.ready(function() {

  	// Email and password for firebase auth
  	$scope.account = {
  		email: "",
  		password: ""
  	};

  	// Properties for new trucks to be stored in db
  	$scope.newUser = {
  		username: "",
  		truck_name: "",
  		cuisine: "",
  		contact_info: "",
  		website_url: "",
  		twitter_handle: "",
  		is_truck: false
  	};

  	// Determines if the user is a food truck or a regular user
  	$scope.isTruck = function () {
  		if ($scope.newUser.is_truck) {
  			return true;
  			$scope.$apply();
  		} else {
  			return false;
  			$scope.$apply();
  		}
  	};

		// Registers a new user and creates a new user_data object through firebase.
		$scope.register = function () {
			ref.createUser({
				// Set user with email and pw
				email: $scope.account.email,
				password: $scope.account.password
			}, function (error, userData) {
				if (error) {
					console.log(`Error creating user: ${error}`);
				} else {
					console.log(`Created user account with UID: ${userData.uid}`, userData);
					authFactory.storeUser(userData.uid, $scope.account, $scope.newUser);
					$scope.login();
				}
			});
		};

		// Authenticates and logs in a previously registered user with firebase.
		$scope.login = function () {
			authFactory.authenticate($scope.account)
				.then(function () {
					$location.path("/user-main");
					$scope.$apply();
				})
		};

		// OAuth login
		$scope.loginWithSocial = function(provider) {
			oAuthService.login(provider, $scope.loginSuccessCallback, $scope.loginErrorCallback);
		};

		// If OAuth is successful, route user to main user view.
		$scope.loginSuccessCallback = function(provider, authData) {
			$location.path("/user-main");
			$scope.$apply();
			// util.showMsg('Success', JSON.stringify(authData));
		};

		// If OAuth fails, alert user to issue.
		$scope.loginErrorCallback = function(provider, error) {
			var errorDefaultMsg = "Invalid authentication";
			var errorCancelMsg = null;
			switch(provider) {
				case SOCIAL.FACEBOOK.PROVIDER:
					errorDefaultMsg = "Unable to connect to facebook";
					errorCancelMsg = "The connection to facebook has been canceled";
					break;
				case SOCIAL.TWITTER.PROVIDER:
					errorDefaultMsg = "Unable to connect to Twitter";
					errorCancelMsg = "The connection to twitter has been canceled";
					break;
				default:
					break;
			}
			showError(error, errorDefaultMsg, errorCancelMsg);
		};

		//Errors to throw using util service.
		var showError = function(error, errorDefaultMsg, errorCancelMsg) {
			var errorMessage = {
				title: "Error",
				msg: null
			};
			if (util.isNullOrBlank(error)) {
				errorMessage.msg = errorDefaultMsg;
			}
			if (util.startsWith(PROBLEM_AUTHENTICATION, error) || util.startsWith(THE_SIGN_IN_FLOW_WAS_CANCELED, error) || util.startsWith(BROWSER_AUTHENTICATION_FAILED, error)) {
				errorMessage.msg = errorCancelMsg;
			}
			if (!util.isNullOrBlank(error) && util.isNullOrBlank(errorMessage.msg)) {
				errorMessage.msg = error;
			}
			util.showMsg(errorMessage.title, errorMessage.msg);
		};

		// User modal partial for new account registration
		$ionicModal.fromTemplateUrl('../partials/register_modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
	    $scope.modal.hide();
	  };

    // Cleanup the modal when we're done with it
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    // Ionic Material Ripple Effect for registration form.
    var reset = function() {
      var inClass = document.querySelectorAll('.in');
      for (var i = 0; i < inClass.length; i++) {
        inClass[i].classList.remove('in');
        inClass[i].removeAttribute('style');
      }

      var done = document.querySelectorAll('.done');
      for (var i = 0; i < done.length; i++) {
        done[i].classList.remove('done');
        done[i].removeAttribute('style');
      }
      
      var ionList = $('#ripple-list').children();
      for (var i = 0; i < ionList.length; i++) {
        var toRemove = ionList[i].className;
        if (/animate-/.test(toRemove)) {
          ionList[i].className = ionList[i].className.replace(/(?:^|\s)animate-\S*(?:$|\s)/, '');
        }
      }
    };

    $scope.ripple = function() {
      reset();
      document.getElementsByTagName('ion-list')[0].className += ' animate-ripple';
      setTimeout(function() {
        ionicMaterialMotion.ripple();
      }, 500);
    };

  // End ionicPlatform.ready()
  });

// End app.controller
});

















