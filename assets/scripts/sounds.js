var SoundManager = {
  messagePop: new Audio('./assets/sounds/message_pop.wav'),
  playMessagePopOnce: function(){
    if(SoundManager.messagePop.paused){
      SoundManager.messagePop.currentTime = 0;
      SoundManager.messagePop.play();
    } else {
      SoundManager.messagePop.pause();
    }
  }
}
