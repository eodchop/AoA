
var provider = new firebase.auth.GoogleAuthProvider();
var Login = {
  pageLoad: function(callback){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        userInfo.displayName = user.displayName;
        userInfo.email = user.email;
        userInfo.emailVerified = user.emailVerified;
        userInfo.photoURL = user.photoURL;
        userInfo.isAnonymous = user.isAnonymous;
        userInfo.uid = user.uid;
        userInfo.providerData = user.providerData;
        // ...
        callback();

      } else {
        firebase.auth().getRedirectResult().then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          callback();
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          console.log(error.message);
          // ...
        });

      }
    });
  },
  loginUser: function(callback) {
    console.log("Login User");
    console.log(userInfo);
    firebase.auth().signInWithRedirect(provider);
    callback();
  },
  logoutUser: function(callback) {
    firebase.auth().signOut().then(function() {
      callback();
    }).catch(function(error) {
      // An error happened.
    })
  }
}
