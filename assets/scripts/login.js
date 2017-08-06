
var config = {
    apiKey: "AIzaSyBhpg16Jjfu0asRXBKRhIzAPQFA7SsvYJQ",
    authDomain: "another-online-adventure.firebaseapp.com",
    databaseURL: "https://another-online-adventure.firebaseio.com/\n",
};

var provider = new firebase.auth.GoogleAuthProvider();

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

firebase.auth().signOut().then(function() {
    // Sign-out successful.
}).catch(function(error) {
    // An error happened.
})

