//Wrapper function to hide variables.
(function() {
  var PlayerData = {
    //A static test player that will be dynamic later on.
    playerRef: database.ref().child('players').child('test_player'),
    playerName: '',
    playerLocation: '',
    playerChatroomRef: {},
    playerLocationRef: {},
    chatListener: {},
    initPlayer: function() {
      this.playerRef.once('value', function(snapshot) {
        PlayerData.playerLocation = snapshot.val().location;
        PlayerData.playerChatroomRef = database.ref()
          .child('location_rooms')
          .child('location_chat')
          .child(PlayerData.playerLocation);
        PlayerData.playerName = snapshot.val().name;
        PlayerData.updateChatroom();
      });
    },
    getSurroundingLocations: function(callback) {
      database.ref()
        .child('location_rooms')
        .child('locations')
        .child(PlayerData.playerLocation)
        .once('value', function(snapshot) {
          callback(snapshot.val());
        });
    },
    changeLocation: function(newLocation) {
      PlayerData.playerRef.update({
        location: newLocation
      });
      ChatHandler.clearChat();
      PlayerData.playerRef.once('value', function(snapshot) {
        PlayerData.playerLocation = snapshot.val().location;
        PlayerData.playerChatroomRef = database.ref()
          .child('location_rooms')
          .child('location_chat')
          .child(PlayerData.playerLocation);
        PlayerData.updateChatroom();
      })
    },
    updateChatroom: function() {
      PlayerData.playerChatroomRef.off('child_added');
      PlayerData.chatListener = PlayerData.playerChatroomRef.on('child_added', function(snapshot) {
        ChatHandler.pushMessageLocal(snapshot.val());
        SoundManager.playMessagePopOnce();
      })
    }
  }
  var ChatHandler = {
    chatMessages: [],
    populateChat: function() {
      $("#textWindow").empty();
      for (message in this.chatMessages) {
        $('#textWindow').append(this.chatMessages[message]);
      }
    },
    showScroll: function() {
      $("#textWindow").css('overflow-y', 'overlay');
    },
    hideScroll: function() {
      $("#textWindow").css('overflow-y', 'hidden');
    },
    pushMessageLocal: function(message) {
      this.chatMessages.push(message);
      this.populateChat();
      this.updateChatScroll();
    },
    pushMessagePublic: function(message) {
      PlayerData.playerChatroomRef.push(message);
      this.updateChatScroll();
    },
    infoAlert: function(message) {
      var alert = $("<p>");
      alert.text(message);
      alert.addClass("infoAlert");
      this.pushMessageLocal(alert);
    },
    listItem: function(message) {
      var newItem = $("<p>");
      var itemIndi = $("<span>");
      itemIndi.addClass('listItemIndicator');
      newItem.addClass('listItem');
      itemIndi.text("[-] ");
      newItem.text(message);
      newItem.prepend(itemIndi);
      newItem.prepend("&emsp;");
      this.pushMessageLocal(newItem);
    },
    playerMessage: function(message) {
      var playerName = $("<span>");
      var fullMessage = $("<p>");
      var messageText = $("<span>");
      playerName.addClass("playerName");
      messageText.addClass("playerMessage");
      playerName.text(PlayerData.playerName);
      messageText.text(message);
      fullMessage.append(' says  "');
      fullMessage.append(messageText);
      fullMessage.append('"');
      fullMessage.prepend(playerName);
      fullMessage.append("<br>");
      ChatHandler.pushMessagePublic(fullMessage.html());
    },
    doMessage: function(message) {
      var action = $("<p>");
      var playerMessage = $("<span>");
      var indicator = $("<span>")
      indicator.text("~");
      indicator.addClass("infoAlert");
      action.prepend(indicator);
      action.prepend("&emsp;");
      playerMessage.addClass('doAction');
      playerMessage.text(PlayerData.playerName + " " + message);
      action.append(playerMessage);
      action.append("<br>");
      ChatHandler.pushMessagePublic(action.html());
    },
    updateChatScroll: function() {
      $("#textWindow").scrollTop($("#textWindow").prop("scrollHeight"));
    },
    clearChat: function() {
      this.chatMessages = [];
      $("#textWindow").empty();
    },
    reloadChat: function() {
      this.chatMessages = [];
      PlayerData.playerChatroomRef.once('value', function(snapshot) {
        for (message in snapshot.val()) {
          ChatHandler.chatMessages.push(snapshot.val()[message]);
        }
        ChatHandler.populateChat();
        ChatHandler.updateChatScroll();
      })
    },
    searchArea: function(area, callback) {
      database.ref().child("location_rooms")
        .child("location_items")
        .child(area)
        .once("value", function(locationItems) {
          database.ref().child('items')
            .once('value', function(items) {
              for (locItem in locationItems.val()) {
                if (locationItems.val()[locItem] in items.val()) {
                  callback(items.val()[locationItems.val()[locItem]]);
                }
              }
            });
        })
    },
    searchItem: function(area, item, callback) {
      item = item.toLowerCase();
      database.ref().child("location_rooms")
        .child("location_items")
        .child(area)
        .once("value", function(locationItems) {
          database.ref().child('items')
            .once('value', function(items) {
              if (locationItems.val().includes(item)) {
                if (items.val().hasOwnProperty(item)) {
                  callback(items.val()[item]);
                }
              } else {
                ChatHandler.infoAlert("You must be looney, there is no such thing as a " + item + " around here.");
              }
            });
        })
    }
  }
  var InputHandler = {
    commands: ['help', 'h', 'say', 's', 'map', 'm',
      'travel', 't', 'clear', 'c', 'reload', 'r',
      'do', 'inspect'
    ],
    parseText: function(input) {
      input = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      var currentCommand = '';
      var message = '';
      if (input.charAt(0) === '/') {
        input = input.slice(1);
        if (input.includes(' ')) {
          currentCommand = input.substr(0, input.indexOf(' '));
          message = input.substr(input.indexOf(' ') + 1);
        } else {
          currentCommand = input;
        }
        if (this.commands.includes(currentCommand)) {
          this[currentCommand](message);
        } else {
          ChatHandler.infoAlert("You did not enter a correct command.");
        }
      } else {
        this.say(input);
      }
    },
    //Commands
    say: function(text) {
      ChatHandler.playerMessage(text);
    },
    help: function(text) {
      ChatHandler.infoAlert("TODO: Fill in help message.");
    },
    map: function(text) {
      ChatHandler.infoAlert("Locations surrounding " + Utils.locationDataReformat(PlayerData.playerLocation) + ": ");
      var messageP = $("<p>")

      PlayerData.getSurroundingLocations(function(data) {
        for (loc in data) {
          ChatHandler.listItem(Utils.locationDataReformat(loc));
        }
      });
    },
    travel: function(text) {
      var location = Utils.reformatToLocationData(text);
      PlayerData.getSurroundingLocations(function(surrounding) {
        if (surrounding.hasOwnProperty(location)) {
          PlayerData.changeLocation(location);
        } else {
          ChatHandler.infoAlert("You did not enter a correct location.");
          InputHandler.map();
        }
      });
    },
    clear: function(text) {
      ChatHandler.clearChat();
    },
    reload: function(text) {
      ChatHandler.reloadChat();
    },
    do: function(text) {
      ChatHandler.doMessage(text);
    },
    inspect: function(text) {
      if (text === "") {
        ChatHandler.infoAlert("You look around and see the following;");
        ChatHandler.searchArea(PlayerData.playerLocation, function(data) {
          ChatHandler.listItem(data.name);
        });
      } else {
        ChatHandler.searchItem(PlayerData.playerLocation, text, function(data) {
          $("#inspectName").text(data.name);
          $("#inspectDesc").text(data.description);
        });
      }
    },
    //Shortcut commands.
    t: function(text) {
      this.travel(text);
    },
    m: function(text) {
      this.map(text);
    },
    s: function(text) {
      this.say(text);
    },
    h: function(text) {
      this.help(text);
    },
    c: function(text) {
      this.clear(text);
    },
    r: function(text) {
      this.reload(text);
    }
  };
  PlayerData.initPlayer();
  //jQuery on-ready.
  $(function() {
    $('#chatForm').on('submit', function(event) {
      event.preventDefault();
      if(!$.isEmptyObject(userInfo.displayName)){
        InputHandler.parseText($('#commandInput').val().trim());
      } else {
        ChatHandler.infoAlert("Please log in!.");
      }
      $('#commandInput').val('');
    })
    $("#textWindow").on("mouseenter", function() {
      ChatHandler.showScroll();
    }).on("mouseleave", function() {
      ChatHandler.hideScroll();
    });
  });
}())
