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
var userInfo = {
  displayName: {},
  email: {},
  emailVerified: {},
  photoURL: {},
  isAnonymous: {},
  uid: {},
  providerData: {},
  clear: function(){
    for(obj in this){
      this[obj] = {}
    }
  }
}
var database = firebase.database();;
//A simple wrapper class to make ajax calls to the api's we use a little
//bit easier.
class AjaxCalls {
    //Used to return the stats of a monster from the dnd api by passing the name.

    // Comic Vine API key:  11732e24163c8156a0f58620d431ff128c12be77
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
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
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
    constitution: 0,

};


$(document).ready(function() {

   //---Recording Character name and Description and writing to game page--//
    $("#charLoadBtn").click(function() {

        name = $("#playerName").val().trim();
        $("#nameDisplay").html(name);
        userCharacter.name = name;
        console.log(name);

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
    //------------on click to generate command list on command Modal-----------//
    $("#commandBtn").click(function() {
      $("#commandBox").empty();
        for (var i in commands) {
            if (commands.hasOwnProperty(i)) {
                //console.log(i + " -> " + commands[i].syntax + commands[i].description);
                var commandEntry = $("<p class='commandText'>").html(commands[i].syntax + ": " + "<br>" + commands[i].description);
                $("#commandBox").append(commandEntry);
                event.preventDefault();
            }
        }

    });

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
        syntax: "/inspect",
        description: "Used to gather information on things in environment"
    },

    help: {
      syntax: "/help or /h",
      description: "Displays information or hints to current goal/area/objective"
    },

    travel: {
      syntax:  "/travel or /t",
      description: "Travels to locations available from current player area"
    },

    clear:{
      syntax:"/clear",
      description:"clears stuff"
    },

    reload:{
      syntax: "/reload or /r",
      description: "reloads the current area I think?"
    },

    do: {
      syntax:"/do",
      description:" do stuff?"
    }

};
<<<<<<< HEAD

=======
>>>>>>> 58e30a99bff5ec621b301c875fbe88b5028d443c
