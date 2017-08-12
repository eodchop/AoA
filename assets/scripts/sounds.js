var SoundManager = {
  messagePop: new Audio('./assets/sounds/messagePop.wav'),
  littleTown: new Audio('./assets/sounds/littleTown.ogg'),
  playMessagePopOnce: function(){
    if(SoundManager.messagePop.paused){
      SoundManager.messagePop.currentTime = 0;
      SoundManager.messagePop.play();
    } else {
      SoundManager.messagePop.pause();
    }
  },
  playBackgroundMusicLoop: function(){
    if(SoundManager.littleTown.paused){
      SoundManager.littleTown.volume = 0.3;
      SoundManager.littleTown.loop = true;
      SoundManager.littleTown.play();
    } else {
      SoundManager.littleTown.pause();
    }
  }
}
