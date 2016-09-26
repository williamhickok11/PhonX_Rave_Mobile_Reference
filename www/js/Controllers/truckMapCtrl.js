"use strict";


app.controller('truckMapCtrl', function($scope, $http, $location, $timeout, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $ionicActionSheet, ionicMaterialInk, firebaseURL, authFactory) {
     
  $ionicPlatform.ready(function() {   

    // Ionic Material Ink
    ionicMaterialInk.displayEffect(); 

    var ref = new Firebase(firebaseURL);

    var currentUser = {};
    var currentTruck = {};

    // Set globally to be set interval function
    var driverInterval;

    // If user isAuthorized, get users and set current user based on uid.
    authFactory.getUser().then(function (UserObj) {
      var userList = UserObj.data;
      var authData = ref.getAuth();
      for (var i = 0; i < userList.length; i++) {
        if(userList[i].uid == authData.uid) {
          currentUser = userList[i];
          // $scope.$apply();
        }
      }
      console.log("Current User:", currentUser);
    }).then(
    // Get current User's truck_user data for location update.
      function () {
        if (currentUser.is_truck) {
          authFactory.getTruck().then(function (TruckObj) {
            var truckList = TruckObj.data;
            for (var i = 0; i < truckList.length; i++) {
              if(truckList[i].uid == currentUser.uid) {
                currentTruck = truckList[i];
                $http.put(
                  `http://localhost:3000/api/truck_user/${currentTruck._id}`,
                  JSON.stringify({
                    is_active: true
                  })
                )
                // $scope.$apply();
              }
            }
          })
        }
      }
    );

    // Checks if current user is a food truck user or not
    $scope.isTruck = function () {
      if (currentUser.is_truck) {
        return true;
        // $scope.$apply();
      } else {
        return false;
        // $scope.$apply();
      }
    };

    var lat;
    var long;

    // Preloader
    $ionicLoading.show({
      template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div><br/>Acquiring location!'
    });
     
    // Options for constant watch of truck location
    var watchOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    // Initiate empty map marker.
    var truckMarker = new google.maps.Marker();

    // Constant watch of current user's current position lat, long
    var watch = $cordovaGeolocation.watchPosition(watchOptions);

    watch.then(
      null, 
      function (err) {
        console.log("Error Message:", err);
      },
      function (position) {
        lat  = position.coords.latitude;
        long = position.coords.longitude;
        
        console.log("Current Coords:", lat, long);

        // Set user's coords
        var myLatLng = new google.maps.LatLng(lat, long);
         
        // Map options
        var mapOptions = {
          center: myLatLng,
          zoom: 16,
          mapTypeControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };  
        
        // Open New Google Map
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        // Drop marker on user's location
        truckMarker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, long),
          map: map
        });

        truckMarker.setPosition(myLatLng);

        // On setInterval update truck's lat/long
        driverInterval = setInterval(
          function () {
            console.log("Coords Updated at Interval.");
            $http.put(
              `http://localhost:3000/api/truck_user/${currentTruck._id}`,
              JSON.stringify({
                lat: lat,
                long: long
              })
            )
          }, 10000
        );

        $scope.map = map;   
        $ionicLoading.hide();     
      }, 
      function(err) {
        $ionicLoading.hide();
        console.log(err);
      }
    );

    // Triggered on a button click, or some other target
    $scope.actionSheet = function() {
      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        destructiveText: 'Logout', 
        destructiveButtonClicked: function () {
          clearInterval(driverInterval);
          $scope.logout();
          return true;
        },
        cancelText: 'Cancel',
        cancelButtonClicked: function() {
          return true;
        }
      });
    };

    // Clear that interval!
    $scope.endTruck = function () {
      clearInterval(driverInterval);
      $scope.setInactive();
    };

    // Deactivate truck/remove coords
    $scope.setInactive = function () {
      $http.put(
        `http://localhost:3000/api/truck_user/${currentTruck._id}`,
        JSON.stringify({
          lat: null,
          long: null,
          is_active: false
        })
      ).then(
        function () {
          $location.path("/user-main");
        }
      )
    };

    // Unauth through Firebase/LogOut/remove coords/deactivate marker
    $scope.logout = function () {
      return new Promise(function () {
        clearInterval(driverInterval);
      }).then(
      $http.put(
        `http://localhost:3000/api/truck_user/${currentTruck._id}`,
        JSON.stringify({
          lat: null,
          long: null,
          is_active: false
        })
      )
      .then(
        function () {
          ref.unauth();
          console.log("User is logged out.");
        }
      )
    )};
    
  // End ionicPlatform.ready
  });
// End dependency function
});























