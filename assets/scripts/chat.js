//Wrapper function to hide variables.
(function() {
  var classBaseStats = {
    Warrior: {
      strength: 6,
      intelligence: 2,
      dexterity: 4,
      constitution: 6
    },
    Ranger: {
      strength: 4,
      intelligence: 4,
      dexterity: 6,
      constitution: 4
    },
    Mage: {
      strength: 2,
      intelligence: 8,
      dexterity: 4,
      constitution: 4
    }
  }
  var PlayerData = {
    //A static test player that will be dynamic later on.
    playerRef: {},
    playerName: '',
    playerLocation: '',
    playerChatroomRef: {},
    playerLocationRef: {},
    lastEnemyRef: null,
    lastPlayerRef: null,
    initPlayer: function() {
      PlayerData.characterExist(userInfo.uid, function(doesExsit) {
        if (!doesExsit) {
          $("#charCreation").toggle();
          ChatHandler.infoAlert("It seems you have not created a character. Please, do so now with the character create button.");
        } else {
          PlayerData.playerRef = database.ref().child('players').child(userInfo.uid);
          PlayerData.playerRef.update({
            isLoggedIn: true
          })
          PlayerData.playerRef.once('value', function(snapshot) {
            PlayerData.playerLocation = snapshot.val().location;
            PlayerData.playerChatroomRef = database.ref()
              .child('location_rooms')
              .child('location_chat')
              .child(PlayerData.playerLocation);
            PlayerData.playerName = snapshot.val().name;
            PlayerData.updateChatroom();
          });
        }
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
      PlayerData.playerChatroomRef.limitToLast(50).on('child_added', function(snapshot) {
        ChatHandler.pushMessageLocal(snapshot.val());
        SoundManager.playMessagePopOnce();
      });
      InputHandler.wipe();
      ChatHandler.shout(" has arrived!", userInfo.name);
    },
    isLoggedIn: function() {
      if ($.isEmptyObject(userInfo.displayName)) {
        return false;
      }
      return true;
    },
    characterExist: function(uid, callback) {
      var usersRef = database.ref().child("players");
      usersRef.child(userInfo.uid).once('value', function(snapshot) {
        if(snapshot.val()){
          callback(snapshot.val().name);
        } else {
          callback(null);
        }
      });
    },
    createCharacter: function(charName, charDesc, charClass) {
      if (charName && charDesc && charClass) {
        if (PlayerData.isLoggedIn()) {
          var charRef = database.ref().child('players');
          charRef.update({
            [userInfo.uid]: {
              name: charName,
              isLoggedIn: true,
              description: charDesc,
              playerClass: charClass,
              exp: 0,
              level: 1,
              location: 'hammerhelm_tavern',
              weapon: 'rusty_stick',
              items: ['rusty_stick'],
              stats: classBaseStats[charClass],
              health: (classBaseStats[charClass].constitution * 5)
            }
          });
        }
      } else {
        ChatHandler.infoAlert("All fields are required.");
      }
    },
    calcDamage: function(playerData, weaponMod) {
      switch (playerData.playerClass) {
        case 'Warrior':
          return (weaponMod * playerData.stats.strength);
          break;
        case 'Mage':
          return (weaponMod * playerData.stats.intelligence);
          break;
        case 'Ranger':
          return (weaponMod * playerData.stats.dexterity);
          break;
        default:
          ChatHandler.infoAlert("You did not choose a correct class.");
          break;
      }
      return 0;
    },
    battle: function(monsterData, monsterLocationRef) {
      var playerStatsRef = database.ref().child('players').child(userInfo.uid);
      playerStatsRef.once("value", function(snapshotPlayer) {
        var playerStats = snapshotPlayer.val();
        var playerWeaponRef = database.ref().child('items').child(playerStats.weapon);
        playerWeaponRef.once("value", function(snapshotWeapon) {
          var weaponStats = snapshotWeapon.val();
          var playerDamage = PlayerData.calcDamage(playerStats, weaponStats.damage_mod);
          ChatHandler.listItem("You attacked " + monsterData.name + " with " + Utils.locationDataReformat(weaponStats.name) + " and did " + playerDamage + " damage!", "->");
          monsterLocationRef.update({
            health: (monsterData.health - playerDamage)
          });
          if ((monsterData.health - playerDamage) > 0) {
            ChatHandler.listItem(monsterData.name + ' attacks ' + playerStats.name + ' back for ' + monsterData.power + " damage!", "<-");
            if (playerStats.health - monsterData.power <= 0) {
              SoundManager.playPlayerDeathSound();
              PlayerData.createCharacter(playerStats.name, playerStats.description, playerStats.playerClass);
              PlayerData.changeLocation('hammerhelm_tavern');
              ChatHandler.shout(' had died and been reborn!');
              InputHandler.wipe();
            } else {
              playerStats.health -= monsterData.power;
              PlayerData.playerRef.update(playerStats);
            }
          } else {
            SoundManager.playDeathSound();
            ChatHandler.doMessage(" had defeated " + monsterData.name + "!");
          }
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
    infoAlert: function(message) {
      var alert = $("<p>");
      alert.text(message);
      alert.addClass("infoAlert");
      this.pushMessageLocal(alert);
    },
    listItem: function(message, indi) {
      indi = indi || "~";
      var newItem = $("<p>");
      var itemIndi = $("<span>");
      itemIndi.addClass('listItemIndicator');
      newItem.addClass('listItem');
      itemIndi.text("[" + indi + "] ");
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
    doMessage: function(message, who) {
      who = who || PlayerData.playerName;
      var action = $("<p>");
      var playerMessage = $("<span>");
      var indicator = $("<span>")
      indicator.text("~");
      indicator.addClass("infoAlert");
      action.prepend(indicator);
      action.prepend("&emsp;");
      playerMessage.addClass('doAction');
      playerMessage.text(who + " " + message);
      action.append(playerMessage);
      action.append("<br>");
      ChatHandler.pushMessagePublic(action.html());
    },
    shout: function(message, who) {
      who = who || PlayerData.playerName;
      var action = $("<p>");
      var playerMessage = $("<span>");
      var indicator = $("<span>")
      indicator.text("|!| ");
      indicator.addClass("infoAlert");
      action.prepend(indicator);
      action.prepend("&emsp;");
      playerMessage.addClass('shout');
      playerMessage.text(who + " " + message);
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
      'do', 'd', 'inspect', 'i', 'login', 'li', 'logout', 'lo', 'giggity',
      'g', 'enemies', 'e', 'wipe', 'w', 'attack', 'atk', 'people', 'ppl',
      'me'
    ],
    commandHistory: [],
    historyIndex: 0,
    parseText: function(input) {
      input = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      var currentCommand = '';
      var message = '';
      if (input.charAt(0) === '/') {
        InputHandler.commandHistory.push(input);
        InputHandler.historyIndex = InputHandler.commandHistory.length;
        input = input.slice(1);
        if (input.includes(' ')) {
          currentCommand = input.substr(0, input.indexOf(' '));
          message = input.substr(input.indexOf(' ') + 1);
        } else {
          currentCommand = input;
        }
        if (this.commands.includes(currentCommand)) {
          if (!PlayerData.isLoggedIn()) {
            if (currentCommand === 'login' || currentCommand === 'li') {
              Login.loginUser(function() {
                PlayerData.initPlayer();
              });
            } else {
              ChatHandler.infoAlert("You are not logged in. Use /login (make sure popups are enabled)");
            }
          } else {
            this[currentCommand](message);
          }
        } else {
          ChatHandler.infoAlert("You did not enter a correct command.");
        }
      } else {
        if (PlayerData.isLoggedIn()) {
          PlayerData.characterExist(userInfo.uid, function(doesExsit) {
            if (doesExsit) {
              InputHandler.say(input);
            } else {
              ChatHandler.infoAlert("It seems you have not created a character. Please, do so now with the character create button.");
            }
          });
        } else {
          ChatHandler.infoAlert("You are not logged in. Use /login (make sure popups are enabled)");
        }
      }
    },
    //Commands
    say: function(text) {
      if (text !== '') {
        ChatHandler.playerMessage(text);
      }
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
          ChatHandler.shout(" has travled to " + Utils.locationDataReformat(location), userInfo.name);
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
    login: function(text) {
      ChatHandler.infoAlert("You are already logged in.");
    },
    logout: function(text) {
      Login.logoutUser(function() {
        ChatHandler.shout(" has logged out!", userInfo.name);
        PlayerData.playerRef.update({
          isLoggedIn: false
        });
        ChatHandler.clearChat();
        ChatHandler.infoAlert("You are now logged out!");
        userInfo.clear();
      });
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
    giggity: function(text) {
      ChatHandler.infoAlert("Giggity, Giggity!")
    },
    enemies: function(text) {
      database.ref().child('location_rooms')
        .child('location_monsters')
        .child(PlayerData.playerLocation)
        .child('list')
        .once('value', function(snapshot) {
          if (snapshot.val()) {
            ChatHandler.infoAlert("You look for hostile beings and find...");
            Utils.asyncLoop(snapshot.val().length, function(loop) {
              var monster = loop.iteration();
              if (snapshot.val()[monster]) {
                if (snapshot.val()[monster].name == 'unnamed') {
                  AjaxCalls.getRandomName(function(newName) {
                    database.ref().child('location_rooms')
                      .child('location_monsters')
                      .child(PlayerData.playerLocation)
                      .child('list')
                      .child(monster).update({
                        name: newName
                      });
                    ChatHandler.listItem((snapshot.val()[monster].type + ' - ' + newName), monster);
                  });
                } else {
                  if (text) {
                    if (PlayerData.lastEnemyRef) {
                      PlayerData.lastEnemyRef.off('value');
                    }
                    PlayerData.lastEnemyRef = database.ref().child('location_rooms')
                      .child('location_monsters')
                      .child(PlayerData.playerLocation)
                      .child('list')
                      .child(text);
                    PlayerData.lastEnemyRef.on('value', function(snapshot) {
                      if (snapshot.val()) {
                        $("#enemyNameDisplay").text("Name: " + snapshot.val().name);
                        $("#enemyType").text("Type: " + snapshot.val().type);
                        $("#enemyDescription").text(snapshot.val().description);
                        $("#enemyHealth").text("Health: " + snapshot.val().health);
                      }
                    })
                    return;
                  } else {
                    ChatHandler.listItem((snapshot.val()[monster].type + ' - ' + snapshot.val()[monster].name), monster);
                  }
                }
              }
              loop.next();
            });
          } else {
            ChatHandler.infoAlert("There doesn't appear to be any enemies!");
          }
        });
    },
    wipe: function(text) {
      this.clear();
      this.reload();
    },
    attack: function(text) {
      database.ref().child('location_rooms')
        .child('location_monsters')
        .child(PlayerData.playerLocation)
        .child('list')
        .once('value', function(snapshot) {
          var monsterList = snapshot.val();
          if (monsterList[text]) {
            if (monsterList[text].name === 'unnamed') {
              AjaxCalls.getRandomName(function(newName) {
                database.ref().child('location_rooms')
                  .child('location_monsters')
                  .child(PlayerData.playerLocation)
                  .child('list')
                  .child(text).update({
                    name: newName
                  });
                monsterList[text].name = newName
                PlayerData.battle(monsterList[text], database.ref().child('location_rooms')
                  .child('location_monsters')
                  .child(PlayerData.playerLocation)
                  .child('list')
                  .child(text));
              })
            } else {
              PlayerData.battle(monsterList[text], database.ref().child('location_rooms')
                .child('location_monsters')
                .child(PlayerData.playerLocation)
                .child('list')
                .child(text));
            }
          } else {
            ChatHandler.infoAlert('You wave your hands about wildly in the air, since your target doesnt seem to exsist.');
          }
        });
    },
    people: function(text) {
      if (text) {
        if (PlayerData.lastPlayerRef) {
          console.log(PlayerData.lastPlayerRef);
          database.ref().child('players').off('value');
        }
        PlayerData.lastPlayerRef = database.ref().child('players').orderByChild('name').equalTo(text).on('value', function(snapshot) {
          if (snapshot.val()) {
            var player = snapshot.val()[Object.keys(snapshot.val())[0]];
            $("#playerNameDisplay").text("Name: " + player.name);
            $("#playerClass").text("Class: " + player.playerClass);
            $("#playerDescriptionInspect").text(player.description);
            $("#playerHealth").text("Health " + player.health);
            $("#playerExp").text("Experince: " + player.exp);
            $("#playerLvl").text("Level: " + player.level + " | Exp to next: " + ((player.level * 50) - player.exp));
            $("#playerWeapon").text("Weapon: " + Utils.locationDataReformat(player.weapon));
          } else {
            ChatHandler.infoAlert(text + " doesn't seem to be a person in the area. Are you feeling okay?");
          }
        });
      } else {
        ChatHandler.infoAlert("<People>");
        database.ref().child('players').orderByChild('location').equalTo(PlayerData.playerLocation).once('value', function(snapshot) {
          if (snapshot.val()) {
            Object.keys(snapshot.val()).forEach(function(person) {
              if (snapshot.val()[person].isLoggedIn) {
                ChatHandler.listItem(snapshot.val()[person].name);
              }
            })
          }
        });
      }
    },
    //Shortcut commands.
    me: function(text) {
      this.ppl(PlayerData.playerName);
    },
    ppl: function(text) {
      this.people(text);
    },
    atk: function(text) {
      this.attack(text);
    },
    w: function(text) {
      this.wipe(text);
    },
    e: function(text) {
      this.enemies(text);
    },
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
    },
    d: function(text) {
      this.do(text);
    },
    i: function(text) {
      this.inspect(text);
    },
    li: function(text) {
      this.login(text);
    },
    lo: function(text) {
      this.logout(text);
    },
    g: function(text) {
      this.giggity(text);
    }
  };

  //jQuery on-ready.
  $(function() {
    var characterClass = '';
    Login.pageLoad(PlayerData.initPlayer);
    SoundManager.playBackgroundMusicLoop();
    $("#music").on('click', function() {
      SoundManager.playBackgroundMusicLoop();
    });
    $("#classSelector li a").on("click", function() {
      characterClass = $(this).text();
    });
    $("#charCreation").toggle();
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
    $("#charLoadBtn").on("click", function() {
      var name = $("#playerName").val();
      var desc = $("#playerDescription").val();
      if (PlayerData.isLoggedIn()) {
        PlayerData.createCharacter(name, desc, characterClass);
        PlayerData.initPlayer();
        $("#charCreation").toggle();
      }
    });
    $("#chatForm").on('keyup', function(event) {
      var keycode = event.keyCode;
      if (keycode === 40) {
        $("#commandInput").val(InputHandler.commandHistory[InputHandler.historyIndex]);
        if (InputHandler.historyIndex < InputHandler.commandHistory.length) {
          InputHandler.historyIndex++;
        }
      }
      if (keycode === 38) {
        $("#commandInput").val(InputHandler.commandHistory[InputHandler.historyIndex]);
        if (InputHandler.historyIndex > 0) {
          InputHandler.historyIndex--;
        }
      }
    });
    $(window).on('unload', function() {
      InputHandler.logout();
    });
  });
}())
