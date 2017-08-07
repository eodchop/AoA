var SoundManager = {
  messagePop: new Audio('./assets/sounds/message_pop.wav'),
  playMessagePopOnce: function(){
    SoundManager.messagePop.currentTime = 0;
    SoundManager.messagePop.play();
  }
}
