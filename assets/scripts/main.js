// Initialize Firebase
var config = {
  apiKey: "AIzaSyBhpg16Jjfu0asRXBKRhIzAPQFA7SsvYJQ",
  authDomain: "another-online-adventure.firebaseapp.com",
  databaseURL: "https://another-online-adventure.firebaseio.com",
  projectId: "another-online-adventure",
  storageBucket: "another-online-adventure.appspot.com",
  messagingSenderId: "550710539266"
};
firebase.initializeApp(config);
var database = firebase.database();

//A simple wrapper class to make ajax calls to the api's we use a little
//bit easier.
class AjaxCalls {
  //Used to return the stats of a monster from the dnd api by passing the name.
  static dndMonstersAPI(name, callback) {
    var baseURL = "http://www.dnd5eapi.co/api/";
    var optionsURL = "monsters/?name=" + name;

    $.ajax({
      url: baseURL + optionsURL,
      type: 'GET',
      dataType: 'json'
    }).done(function(data) {
      AjaxCalls.dndByURLAPI(data.results[0].url, callback);
    })
  }

  static dndByURLAPI(urlToUse, callback) {
    $.ajax({
      url: urlToUse,
      type: 'GET',
      dataType: 'json'
    }).done(function(data) {
      callback(data);
    })
  }
}
