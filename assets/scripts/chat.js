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
    showScroll: function(){
      $("#textWindow").css('overflow-y','scroll');
    },
    hideScroll: function(){
      $("#textWindow").css('overflow-y','hidden');
    },
    pushMessageLocal: function(message) {
      this.chatMessages.push(message);
      this.populateChat();
    },
    pushMessagePublic: function(message) {
      PlayerData.playerChatroomRef.push(message);
    }
  }
  var InputHandler = {
    commands: ['help', 'h', 'say', 's'],
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
    //Shortcut commands.
    s: function(text) {
      this.say(text);
    },
    h: function(text) {
      this.help(text);
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
    $("#textWindow").on("mouseenter", function(){
      ChatHandler.showScroll();
    }).on("mouseleave", function(){
      ChatHandler.hideScroll();
    });
  });
}())
