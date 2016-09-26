"use strict";


app.factory("authFactory", function ($http, firebaseURL) {

  var ref = new Firebase(firebaseURL);

  return {

    // Checks if user is authenticated.
    isAuthenticated () {
      var authData = ref.getAuth();
      if (authData) {
        return true;    
      } else {
        return false;
      }
    },

    // getUser() returns the currentUserData which contains both the uid and userName.
    getUser () {
      return new Promise(function (resolve, reject) {
        $http.get(`http://localhost:3000/api/users/`)
        .then(
          function (userObj) {resolve(userObj)},
          function (error) {reject(error)}
        )
      });
    },

    // getTruck() returns the truck user objects
    getTruck () {
    	return new Promise(function (resolve, reject) {
 				$http.get(`http://localhost:3000/api/truck_user`)
 				.then(
 					function (truckObj) {resolve(truckObj)},
 					function (error) {reject(error)}
 				)  		
    	});
    },

    // Authenticates user through Firebase
    authenticate (credentials) {
      return new Promise(function (resolve, reject) {
        ref.authWithPassword({
          "email": credentials.email,
          "password": credentials.password
        }, function (error, authData) {
          if (error) {
            reject(error);
          } else {
            console.log("Auth with password completed with UID:", authData.uid);
            // currentUID = authData.uid;
            resolve(authData);
          }
        });
      });
    },

    // Upon registration, storeUser() creates an object within the user_data object that contains the uid, userName, and user auth status.
    storeUser (uid, account, user) {
    	// var userRef = new Firebase(`${firebaseURL}/user_data/${firebaseUid}`);
     //  userRef.set({
     //    uid: firebaseUid,
     //    email: account.email,
     //    username: user.username,
     //    is_truck: user.is_truck,
     //  });
	    // If the user is_truck store the user info into the truck_user table data
	    if (user.is_truck) {
	    	$http.post(
	    		`http://localhost:3000/api/truck_user`,
    			JSON.stringify({
    				uid: uid,
    				truck_name: user.truck_name,
    				cuisine: user.cuisine,
    				contact_info: user.contact_info,
    				website_url: user.website_url,
    				twitter_handle: user.twitter_handle
    			})
	    	)
	    };
	    // Set default user data
    	$http.post(
    		`http://localhost:3000/api/users`,
    		JSON.stringify({
    			uid: uid,
    			email: account.email,
    			username: user.username,
    			is_truck: user.is_truck
    		})
    	)
    }

  // End return
  }
// End Factory Function
});

















