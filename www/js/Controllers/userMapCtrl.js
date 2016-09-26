"use strict";


app.controller('userMapCtrl', function($scope, $http, $location, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $ionicModal, $ionicActionSheet, $ionicPopup, ionicMaterialInk, firebaseURL, authFactory) {
     
  $ionicPlatform.ready(function() {  

    $scope.tweets = [];

    // Ionic Material Ink
    ionicMaterialInk.displayEffect();

    var ref = new Firebase(firebaseURL);

    var currentUser = {}; 

    // Globally set var to be setInterval on truck locs
    var userInterval;
    var continueInterval = true;

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
    });

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
    
    // Google maps position option settings for map view.
    var posOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    // Get user's current position lat, long
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      lat  = position.coords.latitude;
      long = position.coords.longitude;
      
      console.log("Current Coords:", lat, long);

      // Set user's coords
      var myLatLng = new google.maps.LatLng(lat, long);
       
      // Map settings
      var mapOptions = {
        center: myLatLng,
        zoom: 16,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };  
      
      // Open New Google Map
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      // Set empty array for all truck coords.
      var allTrucks = [];
      var infowindow = new google.maps.InfoWindow();

      var truckMarker = new google.maps.Marker();

      // Get all truck locs on page load.
      $scope.getAllTrucks = function () {
        return new Promise(function (resolve, reject) {
          $http.get(`http://localhost:3000/api/truck_user`)
          .success(
            function (allTrucksObj) {resolve(allTrucksObj)},
            function (error) {reject(error)}
          )
        })
      };
      // Invoke GET, if there are no active trucks, alert user
      $scope.getAllTrucks().then(
        function (allTrucksObj) {
          // Before GET of all trucks, if none are active alert user.
          var thereAreActives = false;
          // Set array of all truck objects
          allTrucks = allTrucksObj;
          for (var i in allTrucks) {
            if (allTrucks[i].is_active === true) {
              thereAreActives = true;
            }
          }
          if (thereAreActives == false) {
            $ionicPopup.alert({
              title: "No active trucks!"
            });
          }
          console.log("All Truck Users:", allTrucks);
        }
      )
      // Add a marker for each truck at it's exact coords
      .then(
        function () {
          for (var i = 0; i < allTrucks.length; i++) { 
            truckMarker = new google.maps.Marker({
              position: new google.maps.LatLng(allTrucks[i].lat, allTrucks[i].long),
              map: map,
              icon: '../img/truck_icon.png'
            });
            // Add new infowindow to each marker with individual truck data
            truckMarker.info = new google.maps.InfoWindow({
              position: new google.maps.LatLng(allTrucks[i].lat, allTrucks[i].long),
              content:
                `<div>
                  <div class="info-item logo" style="color: red; font-size: 18px; border-bottom: solid 1px red"><p>${allTrucks[i].truck_name}</p></div>
                  <div class="info-item logo" style="color: red; font-size: 18px;"><p>We do ${allTrucks[i].cuisine}</p></div>
                  <div class="info-item"><button id="${allTrucks[i].contact_info}" class="button button-small button-calm button-raised ink-dark icon-left ion-ios-telephone call-button">Place the Order</button></div>
                  <a href="${allTrucks[i].website_url}"><div class="info-item"><button class="button button-small button-calm button-raised ink-dark icon-left ion-ios-information">Check The Web</button></div></a>
                  <div class="info-item"><button id="${allTrucks[i].twitter_handle}" class="button button-small button-calm button-raised ink-dark icon-left ion-social-twitter twitter-button">See the tweets</button></div>
                </div>`
            });
            // Adds event listener to truck markers to open infowindows
            google.maps.event.addListener(truckMarker, 'click', function() {
              this.info.open(map, this);
            });    
          }
        }
      );

      // On map click, close infowindow
      google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
      });
      
      // Begin marker refresh of truck locs on setInterval
      userInterval = setInterval(
        function () {
          // GET all truck locations
          $scope.getAllTrucks = function () {
            return new Promise(function (resolve, reject) {
              $http.get(`http://localhost:3000/api/truck_user`)
              .success(
                function (allTrucksObj) {resolve(allTrucksObj)},
                function (error) {reject(error)}
              )
            })
          };
          // Invoke GET
          $scope.getAllTrucks().then(
            function (allTrucksObj) {
              allTrucks = allTrucksObj;
              for (var i = 0; i < allTrucks.length; i++) {
                truckMarker.setPosition(new google.maps.LatLng(allTrucks[i].lat, allTrucks[i].long));
              }
              console.log("Truck Coords Updated for User.");
            }
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


    // User modal partial for twitter feed registration
    $ionicModal.fromTemplateUrl('../partials/twitter_modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    var twitterQuery;
    // On click of truck's infowindow button, pass the truck's twitter handle to the api call function for twitter feed.
    $('#map').on('click', '.twitter-button', function (event) {
      $scope.modal.show();
      var twitterQuery = event.currentTarget.id;
      $scope.getTwitterFeed(twitterQuery).then(function (tweetsObj) {
        console.log("???", tweetsObj);
      });
      console.log("Current Truck Twitter Handle: ", twitterQuery);
    });

    // On click of truck's infowindow button, pass the truck's twitter handle to the api call function for twitter feed.
    $('#map').on('click', '.call-button', function (event) {
      window.open(`tel:${event.currentTarget.id}`, '_system')
      console.log('??', event.currentTarget.id);
    });


    // Accepts twitter handle of truck that is clicked and calls api with query.
    $scope.getTwitterFeed = function (twitterQuery) {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: `http://localhost:3000/twitter/${twitterQuery}`,
          dataType: 'json',
          method: 'GET',
          success: function callback (data) {
            for (var i = 0; i < data.statuses.length; i++) {
              $scope.tweets.push({
                screen_name: data.statuses[i].user.screen_name,
                text: data.statuses[i].text,
                image: data.statuses[i].user.profile_image_url,
                date: new Date(Date.parse(data.statuses[i].created_at)),
                urls: [data.statuses[i].entities.urls]
              });
            }
          }, function (error) {
            reject(error)
          }
        });
      });
    }

    // General openModal call to open modal
    $scope.openModal = function() {
      $scope.modal.show();
    };

    // Close modal
    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    // Triggered on a button click, or some other target
    $scope.actionSheet = function() {
      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        destructiveText: 'Logout', 
        destructiveButtonClicked: function () {
          clearInterval(userInterval);
          $scope.logout();
          return true;
        },
        cancelText: 'Cancel',
        cancelButtonClicked: function() {
          return true;
        }
      });
    };

    $scope.setActive = function () {
      clearInterval(userInterval);
      $location.path('/truck-main');
    };

    // Unauth through Firebase/LogOut
    $scope.logout = function () {
      clearInterval(userInterval)
      console.log("User is logged out.");
      ref.unauth();
    };

  // End ionicPlatform.ready
  });
// End dependency function
});





























