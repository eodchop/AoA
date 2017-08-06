//Wrapper function to hide variables.
(function() {
  var PlayerData = {
    //A static test player that will be dynamic later on.
    playerRef: database.ref().child('players').child('test_player'),
    playerName: '',
    playerLocation: '',
    playerChatroomRef: {},
    playerLocationRef: {},
    initPlayer: function() {
      this.playerRef.once('value', function(snapshot) {
        PlayerData.playerLocation = snapshot.val().location;
        PlayerData.playerChatroomRef = database.ref()
          .child('location_rooms')
          .child('location_chat')
          .child(PlayerData.playerLocation);
        PlayerData.playerName = snapshot.val().name;
        PlayerData.playerChatroomRef.on('child_added', function(snapshot) {
          ChatHandler.pushMessageLocal(snapshot.val());
        })
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
    changeLocation: function(newLocation){
      PlayerData.playerRef.update({location: newLocation});
      ChatHandler.clearChat();
      PlayerData.playerRef.once('value', function(snapshot){
        PlayerData.playerLocation = snapshot.val().location;
        PlayerData.playerChatroomRef = database.ref()
          .child('location_rooms')
          .child('location_chat')
          .child(PlayerData.playerLocation);
        PlayerData.playerChatroomRef.on('child_added', function(snapshot) {
          ChatHandler.pushMessageLocal(snapshot.val());
        })
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
    infoAlert: function(message){
      var alert = $("<p>");
      alert.text(message);
      alert.addClass("infoAlert");
      this.pushMessageLocal(alert);
    },
    updateChatScroll: function(){
      $("#textWindow").scrollTop($("#textWindow").prop("scrollHeight"));
    },
    clearChat: function(){
      this.chatMessages = [];
      $("#textWindow").empty();
    },
    reloadChat: function(){
      this.chatMessages = [];
      PlayerData.playerChatroomRef.once('value', function(snapshot){
        for(message in snapshot.val()){
          ChatHandler.chatMessages.push(snapshot.val()[message]);
        }
        ChatHandler.populateChat();
        ChatHandler.updateChatScroll();
      })
    }
  }
  var InputHandler = {
    commands: ['help', 'h', 'say', 's', 'map', 'm', 'travel', 't', 'clear', 'c', 'reload', 'r'],
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
          ChatHandler.pushMessageLocal("You did not enter a correct command.<br>");
        }
      }
    },
    //Commands
    say: function(text) {
      var playerName = $("<span>");
      var message = $("<p>");
      playerName.addClass("playerName");
      playerName.text(PlayerData.playerName);
      message.text(" says " + '"' + text + '"');
      message.prepend(playerName);
      message.append("<br>");
      ChatHandler.pushMessagePublic(message.html());
    },
    help: function(text) {
      ChatHandler.pushMessageLocal("TODO: Fill in help message.<br>");
    },
    map: function(text) {
      var messageP = $("<p>")
      messageP.text("Locations surrounding " + Utils.locationDataReformat(PlayerData.playerLocation) + ": ")
        .append("<br>");
      PlayerData.getSurroundingLocations(function(data) {
        for (loc in data) {
          var locationS = $("<span>");
          loc = Utils.locationDataReformat(loc);
          locationS.text("[-] " + loc)
            .prepend("&emsp;")
            .append("<br>");;
          messageP.append(locationS);
        }
        ChatHandler.pushMessageLocal(messageP);
      });
    },
    travel: function(text){
      var location = Utils.reformatToLocationData(text);
      PlayerData.getSurroundingLocations(function(surrounding){
        if(surrounding.hasOwnProperty(location)){
          PlayerData.changeLocation(location);
        } else {
          ChatHandler.pushMessageLocal("<p>You did not enter a correct location.</p>");
        }
      });
    },
    clear: function(text){
      ChatHandler.clearChat();
    },
    reload: function(text){
      ChatHandler.reloadChat();
    },
    //Shortcut commands.
    t: function(text){
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
    c: function(text){
      this.clear(text);
    },
    r: function(text){
      this.reload(text);
    }
  };
  PlayerData.initPlayer();
  //jQuery on-ready.
  $(function() {
    $('#chatForm').on('submit', function(event) {
      event.preventDefault();
      InputHandler.parseText($('#commandInput').val().trim());
      $('#commandInput').val('');
    })
    $("#textWindow").on("mouseenter", function() {
      ChatHandler.showScroll();
    }).on("mouseleave", function() {
      ChatHandler.hideScroll();
    });
  });
}())
