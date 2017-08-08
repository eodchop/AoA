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
    clear: function() {
        for (obj in this) {
            this[obj] = {}
        }
    }
}
var database = firebase.database();
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



    $('.slideout-menu-toggle').on('click', function(event) {
        event.preventDefault();
        // create menu variables
        var slideoutMenu = $('.slideout-menu');
        var slideoutMenuWidth = $('.slideout-menu').width();

        // toggle open class
        slideoutMenu.toggleClass("open");


        // slide menu
        if (slideoutMenu.hasClass("open")) {
            slideoutMenu.animate({
                left: "0px"
            });
            $("#commandBox").empty();
            for (var i in commands) {
                if (commands.hasOwnProperty(i)) {
                    //console.log(i + " -> " + commands[i].syntax + commands[i].description);
                    var commandEntry = $("<p class='commandText'>").html(commands[i].syntax + ": " + "<br>" + commands[i].description);
                    $("#commandBox").append(commandEntry);
                    $("#commandBtn").text("Hide Command List");
                    event.preventDefault();
                }
            }


        } else {
            slideoutMenu.animate({
                left: -slideoutMenuWidth
            }, 250);
            $("#commandBtn").text("Show Command List");
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
        syntax: "/travel or /t",
        description: "Travels to locations available from current player area"
    },

    clear: {
        syntax: "/clear",
        description: "Clears current chat window"
    },

    reload: {
        syntax: "/reload or /r",
        description: "Reloads previous messages in current chat window"
    },

    do: {
        syntax: "/do",
        description: "Have your character complete an action of your choosing"
    }

};


//-----------looking at basic weapons, these return link to weapon string with nested stats---//
function getWeapon() {

    var queryURL = "http://www.dnd5eapi.co/api/equipment/";

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response) {
        console.log(response);
        console.log(response.results[0].url); //----club
        console.log(response.results[4].url); //----dagger
        console.log(response.results[13].url); //------short bow
        console.log(response.results[36].url); //----longbow
        console.log(response.results[62].url); //---rod
        console.log(response.results[64].url); //----wand

    });

}

function getGif() {

    var queryURL = "https://api.giphy.com/v1/gifs/search?q=barbarian&limit=10&api_key=dc6zaTOxFJmzC";

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response) {
        console.log(response);
        console.log(response.data[0].url);
    });

}