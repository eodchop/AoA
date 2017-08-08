
console.log(location.protocol);
var provider = new firebase.auth.GoogleAuthProvider();

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
  } else {
      firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }
});


firebase.auth().signOut().then(function() {
    // Sign-out successful.
}).catch(function(error) {
    // An error happened.
})
