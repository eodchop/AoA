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
var database = firebase.database();;
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

//Utility functions that come in handy everywhere.
var Utils = {
  toTitleCase: function(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },
  locationDataReformat: function(locationString) {
    locationString = locationString.replace("_", " ");
    locationString = Utils.toTitleCase(locationString);
    return locationString;
  },
  reformatToLocationData: function(locationString) {
    locationString = locationString.toLowerCase();
    locationString = locationString.replace(" ", "_");
    return locationString;
  },
  isEmptyObj: function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
}
//---sorting out creating and storing characters

var userCharacter = {

  name: "",
  location: "",
  description: "",
  characterClass: "",
  //example placeholder stats
  str: 0,
  dex: 0,
  health: 0,
<<<<<<< HEAD
  constitution: 0,
=======
  constitution:0,
>>>>>>> 549322aa502aa3dbeb040defc647d386fa0a63d9
};


$(document).ready(function() {


  //---Recording Character name and Description and writing to game page--//
  $("#charLoadBtn").click(function() {

    name = $("#playerName").val().trim();
    $("#nameDisplay").html(name);
    userCharacter.name = name;
    console.log(name);
<<<<<<< HEAD

    description = $("#playerDescription").val().trim();
    $("#descript").html(description);
    userCharacter.description = description;
    console.log(description);

  });

  $("#classSelector li a").click(function() {
    characterClass = $(this).text();
    console.log(characterClass);
    userCharacter.characterClass = characterClass;
    $("#playerClass").html(characterClass);
  });

//  $("#commandBtn").click(function() {
  //  $('#commandBox').animate({
    //  left: endPos
  //  }, 1000);
//  });

});




//---building command object to append to user instruction modal---//

var commands = {
  say: {
    syntax: "/say or /s",
    description: "Used to say something in gobal chat"
  },
  map: {
    syntax: "/map or /m",
    description: "Used to display surrounding locations to travel"
  },

  inspect: {
    syntax: "/inspect"
    description: "Used to gather information on things in environment"
  }
}
=======

    description = $("#playerDescription").val().trim();
    $("#descript").html(description);
    userCharacter.description = description;
    console.log(description);

  });

  $("#classSelector li a").click(function() {
    characterClass = $(this).text();
    console.log(characterClass);
    userCharacter.characterClass = characterClass;
    $("#playerClass").html(characterClass);
  });

});
>>>>>>> 549322aa502aa3dbeb040defc647d386fa0a63d9
