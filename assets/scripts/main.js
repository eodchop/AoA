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
    getRandomIntInclusive: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
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

    $("#commandInput").focus();

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


    //-----------mute chat-----------------//

});

//---building command object to append to user instruction modal---//

var commands = {

    login: {
        syntax: "'/login' or '/li'",
        description: "Use to log into game if you've created a character"
    },

    me: {
        syntax: "'/me'",
        description: "Displays your character information on the right panel if 'Show Character' panel is open"
    },

    say: {
        syntax: "'/say' or '/s'",
        description: "Used to say something in gobal chat"
    },
    map: {
        syntax: "'/map' or '/m'",
        description: "Used to display surrounding locations to travel"
    },

    inspect: {
        syntax: "'/inspect'",
        description: "Used to gather information on things in environment"
    },

    enemies: {
        syntax: "'/enemies' or '/e'",
        description: "Shows a list of enemies in the area which you can attack, to see information on a specific enemy, type '/e' + the number of the enemy in the command line"
    },

    sit: {
        syntax: "'/sit'",
        description: "Use this to regain some lost health and mana"
    },

    attack: {
        syntax: "'/atk' + the number of enemy you want to attack",
        description: "Attacks the enemy corresponding to the number entered"
    },

    help: {
        syntax: "'/help' or '/h'",
        description: "Displays information or hints to current goal/area/objective"
    },

    travel: {
        syntax: "'/travel' or '/t'",
        description: "Travels to locations available from current player area"
    },

    clear: {
        syntax: "'/clear'",
        description: "Clears current chat window"
    },

    reload: {
        syntax: "'/reload' or '/r'",
        description: "Reloads previous messages in current chat window"
    },

    do: {
        syntax: "'/do'",
        description: "Have your character complete an action of your choosing"
    },

    players: {
        syntax: "'/people' or '/ppl'",
        description: "Displays a list of players in the same location"
    },

    wipe: {
        syntax: "'/wipe'",
        description: "Clears the user's local text field"
    },

    logout: {
        syntax: "'/logout' or '/lo'",
        description: "Use to log out of the game"
    },

};

//--------------API testing--------------------------//


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

    var queryURL = "https://api.giphy.com/v1/gifs/search?q=conan&limit=10&api_key=dc6zaTOxFJmzC";

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response) {
        console.log(response);
        console.log(response.data[0].url);
    });

}

/*function getPic() {

    //var queryURL = "https://api.flickr.com/services/feeds/photos_public.gne?tags=orc&limit=5";
    //var queryURL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=29d6f4ccf0b5c3ae814acdab08daad2b&text=orcs";
    var queryURL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=29d6f4ccf0b5c3ae814acdab08daad2b&format=json&nojsoncallback=1&text=wizard&extras=url_o"
    var apiKey = "29d6f4ccf0b5c3ae814acdab08daad2b";

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response) {
        console.log(response);
        console.log(response.photos.photo[0]);
        console.log(response.photos.photo[0].farm);
        console.log(response.photos.photo[0].server);
        console.log(response.photos.photo[0].id);
        console.log(response.photos.photo[0].secret);


        var farmId = response.photos.photo[0].farm;
        var serverId = response.photos.photo[0].server;
        var id = response.photos.photo[0].id;
        var secret = response.photos.photo[0].secret;

        console.log("https://farm" + farmId + ".staticflickr.com/" + serverId + "/" + id + "_" + secret + ".jpg");
        console.log(farmId + ", " + serverId + ", " + id + ", " + secret);

    });

}

function getPic() {

    var queryURL = "https://pixabay.com/api/?key=6164055-a12bf99fce60787bf61756a01&q=goblin&image_type=photo"
    var apiKey =

        $.ajax({
            url: queryURL,
            method: 'GET'
        }).done(function(response) {
            console.log(response);

        });

}

function getPic() {

    var queryURL = "https://thegamesdb.net/api/GetGamesList.php?name=halo"
    var apiKey =

        $.ajax({
            url: queryURL,
            method: 'GET'
        }).done(function(response) {
            console.log(response);

        });

}*/