  var SoundManager = {
      messagePop: new Audio('./assets/sounds/messagePop.wav'),
      littleTown: new Audio('./assets/sounds/littleTown.ogg'),
      deathTone: new Audio('./assets/sounds/orc_die.ogg'),
      playMessagePopOnce: function () {
      if (SoundManager.messagePop.paused) {
          SoundManager.messagePop.currentTime = 0;
          SoundManager.messagePop.play();
      } else {
          SoundManager.messagePop.pause();
      }
  },
  playBackgroundMusicLoop: function () {
      if (SoundManager.littleTown.paused) {
          SoundManager.littleTown.loop = true;
          SoundManager.littleTown.play();
      } else {
          SoundManager.littleTown.pause();
      }
  },
      playDeathSound: function () {
      if (SoundManager.deathTone.paused) {
          SoundManager.deathTone.currentTime = 0;
          SoundManager.deathTone.play();
      } else {
          SoundManager.deathTone.pause();
      }
  },
  }

