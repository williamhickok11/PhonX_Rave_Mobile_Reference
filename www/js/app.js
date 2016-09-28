"use strict";


var app = angular.module('Fuber', ['ionic', 'ionic-material', 'ionicOAuthService', 'ngCordova', 'ngResource', 'ngRoute', 'firebase'])

  .constant("firebaseURL", "https://phonx-rave.firebaseio.com/")
  .service('UtilityService', ['$ionicPopup', function ($ionicPopup) {

    this.isNullOrBlank = function (value) {
      if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
        return true;
      }
      if (typeof value === 'object' && Object.keys(value).length === 0) {
        return true;
      }
      return false;
    };

    this.startsWith = function (fullValue, startsValue) {
      return fullValue.indexOf(startsValue) === 0;
    };

    this.showMsg = function(title, message) {
      $ionicPopup.alert({
        title: title,
        template: message
      });
    };
  }]);


// Creates a promise for each view that requires user authentication before resolving.
var isAuth = function (authFactory) {
  new Promise (function (resolve, reject) {
  if (authFactory.isAuthenticated()) {
    console.log("User is authenticated, resolve route promise.");
    resolve();
  } else {
    console.log("User is not authenticated, reject route promise.");
    reject();
  }
})};

// Routings for partials and their controllers for user views.
app.config(["$routeProvider",
  function ($routeProvider) {
    $routeProvider.
      when("/login", {
        templateUrl: "partials/login.html",
        controller: "loginCtrl"
      }).
      when("/truck-main", {
        templateUrl: "partials/truck_map_view.html",
        controller: "truckMapCtrl",
        resolve: {isAuth}
      }).
      when("/main-menu", {
        templateUrl: "partials/main-menu.html",
        controller: "main_menu_Ctrl",
        resolve: {isAuth}
      }).
      otherwise({
        redirectTo: "/login"
      });
  }
]);

// When the application runs...
app.run(function($ionicPlatform, $location, firebaseURL) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
  // If a change in authorization happens, redirect to login
  var appRef = new Firebase(firebaseURL);

  // If user is unauthenticated, reroute to login page.
  appRef.onAuth(function (authData) {
    if (!authData) {
      console.log("Unauthenticated user.");
      $location.path("/login");
    }
  });
});
 











