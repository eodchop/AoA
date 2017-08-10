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
            this[obj] = {};
        }
    }
};
var database = firebase.database();
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
    },
    xmlToJson: function(xml) {

        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        // If just one text node inside
        if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
            obj = xml.childNodes[0].nodeValue;
        } else if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    },
    asyncLoop: function(iterations, func) {
        var index = 0;
        var done = false;
        var loop = {
            next: function() {
                if (done) {
                    return;
                }

                if (index < iterations) {
                    index++;
                    func(loop);

                } else {
                    done = true;
                }
            },

            iteration: function() {
                return index;
            },

            break: function() {
                done = true;
            }
        };
        loop.next();
        return loop;
    }
};
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
        });
    }

    static getRandomName(callback) {
        var baseURL = "https://www.behindthename.com/api/random.php?number=2&gender=both&surname=&all=no&usage_fntsy=1&key=cg465520?number=2&gender=both&surname=&all=no&usage_fntsy=1&key=cg465520";

        $.ajax({
            url: baseURL,
            type: 'GET',
            dataType: 'xml'
        }).done(function(data) {
            var newName = Utils.xmlToJson(data).response.names.name;
            callback(newName[0] + " " + newName[1]);
        });
    }

    static dndByURLAPI(urlToUse, callback) {
        $.ajax({
            url: urlToUse,
            type: 'GET',
            dataType: 'json'
        }).done(function(data) {
            callback(data);
        });
    }
}

var userCharacter = {

    name: "",
    location: "",
    description: "",
    characterClass: "",
    //example placeholder stats
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

        var slideoutMenu = $('.slideout-menu');
        var slideoutMenuWidth = $('.slideout-menu').width();

        slideoutMenu.toggleClass("open");

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
                left: -350 //(-slideoutMenuWidth)
            }, 250);
            $("#commandBtn").text("Show Command List");
        }


    });


    //--------------slide out right panel for character info-------//

    $('.slideout-menu-right-toggle').on('click', function(event) {
        event.preventDefault();

        var slideoutMenu = $('.slideout-menu-right');
        var slideoutMenuWidth = $('.slideout-menu-right').width();
        slideoutMenu.toggleClass("open");

        if (slideoutMenu.hasClass("open")) {
            slideoutMenu.animate({
                right: "0px"
            });
            $("#characterBtn").text("Hide Character Panel");

        } else {
            slideoutMenu.animate({
                right: -350 //(-slideoutMenuWidth)
            }, 250);
            $("#characterBtn").text("Show Character Panel");
        }
    });

    //-----------------fullscreen functions--------------///
    $('#eddieBtn').click(function(e) {
        $('#mainWindow').toggleClass('fullscreen');
        $('#textWindow').toggleClass('fullscreen');

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
//--------------API testing--------------------------//

// Comic Vine API key:  11732e24163c8156a0f58620d431ff128c12be77

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
